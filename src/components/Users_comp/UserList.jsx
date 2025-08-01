import React from "react";
import { Edit, Lock, Unlock } from "lucide-react";

const UserList = ({ users, onEdit, onBlock }) => {
  if (users.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/20 rounded-lg p-8 text-center text-gray-700">
        No users found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full backdrop-blur-md bg-white/20 rounded-lg overflow-hidden">
        <thead className="bg-blue-500 backdrop-blur-md border-b border-blue-200/30">
          <tr>
            <th className="py-3 px-4 text-left text-white font-medium">Name</th>
            <th className="py-3 px-4 text-left text-white font-medium">
              Login ID
            </th>
            <th className="py-3 px-4 text-left text-white font-medium">
              Status
            </th>
            <th className="py-3 px-4 text-left text-white font-medium">
              Created At
            </th>
            <th className="py-3 px-4 text-center text-white font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className=" hover:bg-blue-300/30 text-gray-600"
            >
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4">{user.loginId}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-3 py-1 text-xs rounded-full ${
                    user.is_blocked
                      ? "bg-red-100/80 text-red-800 backdrop-blur-sm"
                      : "bg-green-100/80 text-green-800 backdrop-blur-sm"
                  }`}
                >
                  {user.is_blocked ? "Blocked" : "Active"}
                </span>
              </td>
              <td className="py-3 px-4">
                {new Date(user.createdAt).toLocaleDateString("en-GB")}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 bg-blue-100/50 hover:bg-blue-200/70 text-blue-700 rounded-full backdrop-blur-sm transition-colors duration-150"
                    title="Edit user"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onBlock(user._id, !user.is_blocked)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors duration-150 ${
                      user.is_blocked
                        ? "bg-green-100/50 hover:bg-green-200/70 text-green-700"
                        : "bg-red-100/50 hover:bg-red-200/70 text-red-700"
                    }`}
                    title={user.is_blocked ? "Unblock user" : "Block user"}
                  >
                    {user.is_blocked ? (
                      <Unlock size={16} />
                    ) : (
                      <Lock size={16} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
