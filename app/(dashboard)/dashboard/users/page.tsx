'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function UsersManagementPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
      setLoading(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role')
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) throw new Error('Failed to add user')

      toast({
        title: "Success",
        description: "User added successfully"
      })
      setShowAddUser(false)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive"
      })
    }
  }

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    const formData = new FormData(e.currentTarget)
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      password: formData.get('password')
    }

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) throw new Error('Failed to update user')

      toast({
        title: "Success",
        description: "User updated successfully"
      })
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete user')

      toast({
        title: "Success",
        description: "User deleted successfully"
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  if (!session || session.user.role !== 'admin') {
    return <div className="p-6">Access denied. Admin only.</div>
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const UserForm = ({ user, onSubmit, onCancel }: { 
    user?: User, 
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, 
    onCancel: () => void 
  }) => (
    <div className="border rounded-lg p-6 my-4 bg-card">
      <h2 className="text-xl font-semibold mb-4">{user ? 'Edit User' : 'Add New User'}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={user?.name} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={user?.email} required />
        </div>
        <div>
          <Label htmlFor="password">Password {user && '(leave empty to keep current)'}</Label>
          <Input id="password" name="password" type="password" required={!user} />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <select 
            id="role" 
            name="role" 
            className="w-full p-2 border rounded-md"
            defaultValue={user?.role}
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{user ? 'Update User' : 'Add User'}</Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setShowAddUser(true)}>Add New User</Button>
      </div>

      {showAddUser && (
        <UserForm
          onSubmit={handleAddUser}
          onCancel={() => setShowAddUser(false)}
        />
      )}

      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={handleEditUser}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <div className="grid gap-4">
        <div className="grid grid-cols-5 font-semibold p-4 bg-muted rounded-t-lg">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Created At</div>
          <div>Actions</div>
        </div>
        {users.map((user) => (
          <div key={user._id} className="grid grid-cols-5 p-4 border-b items-center hover:bg-muted/50">
            <div>{user.name}</div>
            <div>{user.email}</div>
            <div className="capitalize">{user.role}</div>
            <div>{new Date(user.createdAt).toLocaleDateString()}</div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingUser(user)}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteUser(user._id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
