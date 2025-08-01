import React from 'react'

const OrderSummary = ({
  products,
  services,
  total,
  discount,
  setDiscount,
  vatRate,
  setVatRate
}) => {
  // Calculate subtotals
  const productTotal = products.reduce(
    (sum, product) => sum + product.sellingPrice * product.quantity,
    0
  )
  const serviceTotal = services.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  )

  // Calculate VAT amount (vatRate % of product+service total)
  const vatAmount = total * (vatRate / 100)

  // Calculate subtotal (total + VAT)
  const subtotal = total + vatAmount

  // Calculate final total after discount
  const finalTotal = subtotal - discount

  return (
    <div className='mt-8 border-t  pt-6 bg-gray-700 border-gray-600 shadow-xl rounded-2xl p-6 border'>
      <h3 className='text-2xl font-semibold mb-6 text-gray-200'>
        Order Summary
      </h3>
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>VAT Rate (%)</span>
          <input
            type='number'
            className='w-24 py-1.5 px-3 bg-gray-600 border border-gray-500 rounded-lg shadow-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400'
            value={vatRate}
            onChange={e => setVatRate(Number(e.target.value) || 0)}
            placeholder='e.g., 5'
          />
        </div>

        <div className='flex justify-between'>
          <span className='text-gray-300'>Products Subtotal:</span>
          <span className='font-medium text-gray-200'>
            ₹{productTotal.toFixed(2)}
          </span>
        </div>

        <div className='flex justify-between'>
          <span className='text-gray-300'>Services Subtotal:</span>
          <span className='font-medium text-gray-200'>
            ₹{serviceTotal.toFixed(2)}
          </span>
        </div>

        <div className='flex justify-between'>
          <span className='text-gray-300'>Net Amount:</span>
          <span className='font-medium text-gray-200'>₹{total.toFixed(2)}</span>
        </div>

        <div className='flex justify-between'>
          <span className='text-gray-300'>VAT ({vatRate}%):</span>
          <span className='font-medium text-gray-200'>
            ₹{vatAmount.toFixed(2)}
          </span>
        </div>

        <div className='flex justify-between font-medium border-t border-gray-600 pt-4 mt-4'>
          <span className='text-gray-200'>Subtotal (incl. VAT):</span>
          <span className='text-gray-200'>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>Discount:</span>
          <input
            type='number'
            className='w-24 py-1.5 px-3 bg-gray-600 border border-gray-500 rounded-lg shadow-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400'
            value={discount}
            onChange={e => setDiscount(Number(e.target.value) || 0)}
            placeholder='0.00'
          />
        </div>

        <div className='border-t border-gray-600 pt-4 mt-4'>
          <div className='flex justify-between text-2xl font-semibold'>
            <span className='text-indigo-400'>Total:</span>
            <span className='text-gray-100'>₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
