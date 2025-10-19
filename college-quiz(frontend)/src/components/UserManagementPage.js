// src/components/UserManagementPage.js
import React, { useState } from "react";
import Navbar from "./Navbar";
import BackButton from "./BackButton";
import "../App.css";

const UserManagementPage = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Alice", role: "Student", email: "alice@example.com" },
    { id: 2, name: "Bob", role: "Faculty", email: "bob@example.com" },
    { id: 3, name: "Charlie", role: "Student", email: "charlie@example.com" },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    role: "Student",
    email: "",
  });

  const [editingId, setEditingId] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Save user (Add or Update)
  const handleSave = () => {
    if (!newUser.name || !newUser.email) return;

    if (editingId) {
      setUsers(
        users.map((u) =>
          u.id === editingId ? { ...newUser, id: editingId } : u
        )
      );
      setEditingId(null);
    } else {
      setUsers([...users, { ...newUser, id: Date.now() }]);
    }

    setNewUser({ name: "", role: "Student", email: "" });
  };

  // Edit user
  const handleEdit = (user) => {
    setNewUser(user);
    setEditingId(user.id);
  };

  // Delete user
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div>
      <Navbar studentName="Admin Panel" />
      <div className="usermanagement-container">
        <BackButton />
        <h2>User Management</h2>

        {/* Add/Edit User Form */}
        <div className="user-form">
          <input
            type="text"
            name="name"
            placeholder="Enter name"
            value={newUser.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={newUser.email}
            onChange={handleChange}
          />
          <select name="role" value={newUser.role} onChange={handleChange}>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
          </select>
          <button className="add-btn" onClick={handleSave}>
            {editingId ? "✏ Update User" : "➕ Add User"}
          </button>
        </div>

        {/* User List Table */}
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(u)}>
                    ✏ Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(u.id)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
