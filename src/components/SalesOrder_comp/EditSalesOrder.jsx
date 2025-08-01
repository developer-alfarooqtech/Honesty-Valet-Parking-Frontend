import React, { useState, useEffect } from 'react'
import { X, MessageSquare, Trash2 } from 'lucide-react'
import CustomerSelector from './CustomerSelector'
import ProductSelector from './ProductSelector'
import ServiceSelector from './ServiceSelector'
import OrderSummary from './OrderSummary'
import ProductNoteModal from './ProductNoteModal'
import {
  getSalesOrderById,
  updateSalesOrder
} from '../../service/salesOrderService'
import toast from 'react-hot-toast'

const EditSalesOrder = ({ orderId, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [vatRate, setVatRate] = useState(5)
  const [discount, setDiscount] = useState(0)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [currentItemForNote, setCurrentItemForNote] = useState(null)
  const [noteType, setNoteType] = useState('')
  const [orderIdValue, setOrderIdValue] = useState('')
  const [lpoValue, setLpoValue] = useState('')
  const [originalOrder, setOriginalOrder] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoadingOrder(true)
        const response = await getSalesOrderById(orderId)
        const order = response.data

        setOriginalOrder(order)
        setOrderIdValue(order.OrderId)
        setLpoValue(order.lpo)
        setSelectedCustomer(order.customer)
        setOrderDate(new Date(order.date).toISOString().split('T')[0])
        setDescription(order.description || '')
        setVatRate(order.vatRate)
        setDiscount(order.discount)

        // Transform products for the form
        const products = order.products.map(item => ({
          ...item.product,
          _id: item.product._id,
          quantity: item.quantity,
          sellingPrice: item.price,
          purchasePrice: item.purchasePrice,
          note: item.note || '',
          // Create a batch structure for compatibility
          selectedBatch: {
            _id: 'temporary-id', // This is just for UI consistency
            purchasePrice: item.purchasePrice,
            stock: item.quantity // Temporarily use quantity as stock for UI
          }
        }))
        setSelectedProducts(products)

        // Transform services for the form
        const services = order.services.map(item => ({
          ...item.service,
          _id: item.service._id,
          quantity: item.quantity,
          price: item.price,
          note: item.note || ''
        }))
        setSelectedServices(services)
      } catch (error) {
        console.error('Error fetching order:', error)
        setError('Failed to load order details')
        toast.error('Failed to load order details')
      } finally {
        setLoadingOrder(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const handleCustomerSelect = customer => {
    setSelectedCustomer(customer)
  }

  const handleProductSelect = product => {
    const exists = selectedProducts.some(p => p._id === product._id)
    if (!exists) {
      setSelectedProducts([
        ...selectedProducts,
        {
          ...product,
          quantity: product.quantity || 1,
          note: '',
          selectedBatch: product.selectedBatch,
          purchasePrice: product.purchasePrice || 0
        }
      ])
    }
  }

  const handleProductQuantityChange = (productId, quantity) => {
    setSelectedProducts(
      selectedProducts.map(p =>
        p._id === productId ? { ...p, quantity: parseInt(quantity) || 0 } : p
      )
    )
  }

  const handleProductPriceChange = (productId, price) => {
    setSelectedProducts(
      selectedProducts.map(p =>
        p._id === productId ? { ...p, sellingPrice: parseFloat(price) || 0 } : p
      )
    )
  }

  const handleRemoveProduct = productId => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId))
  }

  const handleServiceSelect = service => {
    const exists = selectedServices.some(s => s._id === service._id)
    if (!exists) {
      setSelectedServices([
        ...selectedServices,
        { ...service, quantity: 1, note: '' }
      ])
    }
  }

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices(
      selectedServices.map(s =>
        s._id === serviceId ? { ...s, quantity: parseInt(quantity) || 0 } : s
      )
    )
  }

  const handleServicePriceChange = (serviceId, value) => {
    setSelectedServices(
      selectedServices.map(s =>
        s._id === serviceId ? { ...s, price: parseFloat(value) || 0 } : s
      )
    )
  }

  const handleRemoveService = serviceId => {
    setSelectedServices(selectedServices.filter(s => s._id !== serviceId))
  }

  // Note handling functions
  const openNoteModal = (item, type) => {
    setCurrentItemForNote(item)
    setNoteType(type)
    setNoteModalOpen(true)
  }

  const handleSaveNote = note => {
    if (noteType === 'product') {
      setSelectedProducts(
        selectedProducts.map(p =>
          p._id === currentItemForNote._id ? { ...p, note } : p
        )
      )
    } else if (noteType === 'service') {
      setSelectedServices(
        selectedServices.map(s =>
          s._id === currentItemForNote._id ? { ...s, note } : s
        )
      )
    }
    setNoteModalOpen(false)
    setCurrentItemForNote(null)
  }

  const handleUpdateOrder = async () => {
    // Validate inputs
    const trimmedOrderId = orderIdValue.trim()
    const trimmedlpo = lpoValue.trim()
    const trimmedDescription = description.trim()

    if (!selectedCustomer) {
      setError('Please select a custoemr')
      toast.error('Please Select a custoemr')
      return
    }

    if (trimmedOrderId === '') {
      toast.error('Please Enter Order ID')
      return
    }

    if (selectedProducts.length === 0 && selectedServices.length === 0) {
      setError('Please select at least one product or service')
      toast.error('Please select at least one product or service')
      return
    }

    // Calculate net amount (before VAT)
    const productTotal = selectedProducts.reduce(
      (sum, product) => sum + product.sellingPrice * product.quantity,
      0
    )

    const serviceTotal = selectedServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    )

    const netAmount = productTotal + serviceTotal

    // Calculate VAT
    const vatAmount = netAmount * (vatRate / 100)

    // Calculate subtotal (net amount + VAT)
    const subtotal = netAmount + vatAmount

    // Calculate final total (subtotal - discount)
    const finalTotal = subtotal - discount

    const productsForOrder = selectedProducts.map(p => ({
      product: p._id,
      quantity: p.quantity,
      price: p.sellingPrice,
      purchasePrice: p.purchasePrice || 0,
      note: p.note,
      batchId: p.selectedBatch ? p.selectedBatch._id : null
    }))

    // Create order object
    const orderData = {
      OrderId: trimmedOrderId,
      lpo: trimmedlpo,
      customer: selectedCustomer._id,
      products: productsForOrder,
      services: selectedServices.map(s => ({
        service: s._id,
        quantity: s.quantity,
        price: s.price,
        note: s.note
      })),
      netAmount,
      vatRate,
      vatAmount,
      subtotal,
      total: finalTotal,
      date: orderDate,
      description: trimmedDescription,
      discount
    }

    setLoading(true)
    try {
      const response = await updateSalesOrder(orderId, orderData)

      if (response.status !== 200) {
        throw new Error('Failed to update order')
      }

      toast.success('Sales Order Updated Successfully')
      onSuccess && onSuccess()
    } catch (err) {
      setError(err.response?.data.message || 'Failed to update order')
      toast.error(err.response?.data.message || 'Failed to update order')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    const productTotal = selectedProducts.reduce(
      (sum, product) => sum + product.sellingPrice * product.quantity,
      0
    )

    const serviceTotal = selectedServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0
    )

    return productTotal + serviceTotal
  }

  if (loadingOrder) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700'></div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-6 animate-fade-in'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-blue-500'>
          Edit Sales Order
        </h2>
        <button
          onClick={onCancel}
          className='flex items-center text-gray-600 hover:text-gray-800'
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-3 gap-6 mb-6'>
        <div>
          <label className='block text-sm font-medium text-blue-600 mb-1'>
            Order ID
          </label>
          <input
            type='text'
            value={orderIdValue}
            onChange={e => setOrderIdValue(e.target.value)}
            className='w-full px-3 py-2 border border-blue-500 rounded-md'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-blue-600 mb-1'>
            Customer LPO
          </label>
          <input
            type='text'
            value={lpoValue}
            placeholder='Enter LPO'
            onChange={e => setLpoValue(e.target.value)}
            className='w-full px-3 py-2 border border-blue-500 rounded-md'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-blue-600 mb-1'>
            Order Date
          </label>
          <input
            type='date'
            value={orderDate}
            onChange={e => setOrderDate(e.target.value)}
            className='w-full px-3 py-2 border border-blue-500 rounded-md'
          />
        </div>
      </div>
      <div className='mb-6'>
        <label className='block text-sm font-medium text-blue-600 mb-1'>
          Description
        </label>
        <input
          type='text'
          value={description}
          onChange={e => setDescription(e.target.value)}
          className='w-full px-3 py-2 border border-blue-500 rounded-md'
        />
      </div>

      <div className='mb-6'>
        <label className='block text-sm font-medium text-blue-600 mb-1'>
          Select Customer
        </label>

        <CustomerSelector
          onCustomerSelect={handleCustomerSelect}
          selectedCustomer={selectedCustomer}
        />
      </div>

      <div className='mb-6'>
        <h3 className='text-lg font-medium mb-3 text-blue-500'>Products</h3>
        <ProductSelector onProductSelect={handleProductSelect} />

        {selectedProducts.length > 0 && (
          <div className='mt-4 border border-blue-500 rounded-md overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Product
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Code
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Price
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Quantity
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Total
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Notes
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {selectedProducts.map(product => (
                  <tr key={product._id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {product.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {product.code}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <input
                        type='number'
                        min='1'
                        value={product.sellingPrice}
                        onChange={e =>
                          handleProductPriceChange(product._id, e.target.value)
                        }
                        className='w-20 px-2 py-1 border border-blue-500 rounded'
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <input
                        type='number'
                        min='1'
                        max={
                          product.selectedBatch
                            ? product.selectedBatch.stock
                            : 999
                        }
                        value={product.quantity}
                        onChange={e =>
                          handleProductQuantityChange(
                            product._id,
                            e.target.value
                          )
                        }
                        className='w-20 px-2 py-1 border border-blue-500 rounded'
                      />
                      {product.selectedBatch && (
                        <div className='text-xs text-gray-500 mt-1'>
                          Batch: {product.purchasePrice?.toFixed(2) || 'N/A'}{' '}
                          AED
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {(product.sellingPrice * product.quantity).toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <button
                        onClick={() => openNoteModal(product, 'product')}
                        className='flex items-center text-blue-600 hover:text-blue-900'
                      >
                        <MessageSquare size={18} className='mr-1' />
                        {product.note ? 'Edit Note' : 'Add Note'}
                      </button>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <button
                        onClick={() => handleRemoveProduct(product._id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className='mb-6'>
        <h3 className='text-lg font-medium mb-3 text-blue-500'>Services</h3>
        <ServiceSelector onServiceSelect={handleServiceSelect} />

        {selectedServices.length > 0 && (
          <div className='mt-4 border border-blue-500 rounded-md overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Service
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Code
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Price
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Quantity
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Total
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Notes
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {selectedServices.map(service => (
                  <tr key={service._id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {service.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {service.code}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <input
                        type='number'
                        min='1'
                        value={service.price}
                        onChange={e =>
                          handleServicePriceChange(service._id, e.target.value)
                        }
                        className='w-20 px-2 py-1 border border-blue-300 rounded'
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <input
                        type='number'
                        min='1'
                        value={service.quantity}
                        onChange={e =>
                          handleServiceQuantityChange(
                            service._id,
                            e.target.value
                          )
                        }
                        className='w-20 px-2 py-1 border border-blue-500 rounded'
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {(service.price * service.quantity).toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <button
                        onClick={() => openNoteModal(service, 'service')}
                        className='flex items-center text-blue-600 hover:text-blue-900'
                      >
                        <MessageSquare size={18} className='mr-1' />
                        {service.note ? 'Edit Note' : 'Add Note'}
                      </button>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <button
                        onClick={() => handleRemoveService(service._id)}
                        className='text-red-600 hover:text-red-900'
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderSummary
        products={selectedProducts}
        services={selectedServices}
        total={calculateTotal()}
        discount={discount}
        setDiscount={setDiscount}
        vatRate={vatRate}
        setVatRate={setVatRate}
      />

      <div className='mt-8 flex justify-end'>
        <button
          onClick={onCancel}
          className='px-4 py-2 mr-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300'
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateOrder}
          disabled={loading}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300'
        >
          {loading ? 'Updating...' : 'Update Order'}
        </button>
      </div>

      {/* Note Modal */}
      <ProductNoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSave={handleSaveNote}
        item={currentItemForNote}
        type={noteType}
      />
    </div>
  )
}

export default EditSalesOrder

