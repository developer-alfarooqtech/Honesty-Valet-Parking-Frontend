import React, { useState, useEffect } from "react";
import {
  createUser,
  getAllUsers,
  updateUser,
  blockUser,
} from "../service/mainService";
import UserList from "../components/Users_comp/UserList";
import UserFormModal from "../components/Users_comp/UserFormModal";
import { AlertCircle, UserPlus, Users as UsersIcon } from "lucide-react";
import { useSelector } from "react-redux";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers();
      setUsers(response.data?.users);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      setIsLoading(true);
      await createUser(userData);
      await fetchUsers();
      setShowModal(false);
    } catch (err) {
      setError("Failed to create user");
      console.error("Error creating user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      setIsLoading(true);
      await updateUser(userId, userData);
      await fetchUsers();
      setShowModal(false);
      setEditUser(null);
    } catch (err) {
      setError("Failed to update user");
      console.error("Error updating user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      setIsLoading(true);
      await blockUser(userId, isBlocked);
      await fetchUsers();
    } catch (err) {
      setError(`Failed to ${isBlocked ? "block" : "unblock"} user`);
      console.error("Error blocking/unblocking user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditUser(null);
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="backdrop-blur-md bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg shadow-lg">
              <UsersIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-500">Users</h1>
              <p className="text-blue-400 font-medium">Manage your Users</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditUser(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md"
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>

        {error && (
          <div className="backdrop-blur-md bg-red-100/80 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center shadow-sm">
            <AlertCircle className="mr-2" size={16} />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-blue-600">Loading users...</p>
          </div>
        ) : (
          <UserList
            users={users}
            onEdit={handleEditClick}
            onBlock={handleBlockUser}
          />
        )}
      </div>

      {/* Modal will be rendered conditionally based on showModal state */}
      <UserFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editUser ? handleUpdateUser : handleCreateUser}
        editUser={editUser}
        currentUser={user}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Users;
