"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Calendar, Clock, MapPin, AlertCircle, CheckCircle, X } from "lucide-react";

interface Schedule {
  scheduleID:number;
  id: number;
  community: string;
  pickupDay: string;
  pickupTime: string;
  frequency: string;
  truckRoute: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export default function AdminSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    community: "",
    pickupDay: "",
    pickupTime: "",
    frequency: "Weekly",
    truckRoute: "",
    status: "Active" as "Active" | "Inactive",
  });

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/schedule");
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);
      setSchedules(data.schedules || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        community: schedule.community,
        pickupDay: schedule.pickupDay,
        pickupTime: schedule.pickupTime,
        frequency: schedule.frequency,
        truckRoute: schedule.truckRoute,
        status: schedule.status,
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        community: "",
        pickupDay: "",
        pickupTime: "",
        frequency: "Weekly",
        truckRoute: "",
        status: "Active",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.community || !formData.pickupDay || !formData.pickupTime) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const method = editingSchedule ? "PUT" : "POST";
      const url = editingSchedule ? `/api/schedule/${editingSchedule.id}` : "/api/schedule";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      // Update local state
      if (editingSchedule) {
        setSchedules(schedules.map((s) => (s.id === editingSchedule.id ? data.schedule : s)));
      } else {
        setSchedules([...schedules, data.schedule]);
      }

      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save schedule");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setSchedules(schedules.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete schedule");
    }
  };

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.community.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.pickupDay.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || schedule.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const frequencies = ["Weekly", "Bi-weekly", "Monthly", "Twice a week"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">📅 Schedule Management</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage garbage pickup schedules</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 sm:px-6 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={20} /> New Schedule
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search community or day..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "All" | "Active" | "Inactive")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Stats */}
            <div className="bg-green-50 rounded-lg p-3 flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="text-green-600" size={18} />
              <span className="text-gray-700">
                <strong>{filteredSchedules.filter((s) => s.status === "Active").length}</strong> Active
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-3">Loading schedules...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 text-lg mb-4">No schedules found</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={18} /> Create First Schedule
            </button>
          </div>
        ) : (
          /* Table - Desktop View */
          <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Community</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Truck Route</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.scheduleID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{schedule.community}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{schedule.pickupDay}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      {schedule.pickupTime}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{schedule.frequency}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      {schedule.truckRoute}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          schedule.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(schedule)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(schedule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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

        {/* Card View - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {filteredSchedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{schedule.community}</h3>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Calendar size={16} />
                    {schedule.pickupDay}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    schedule.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {schedule.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>{schedule.pickupTime}</span>
                </div>
                <div className="text-gray-600">{schedule.frequency}</div>
                <div className="flex items-center gap-2 text-gray-600 col-span-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{schedule.truckRoute}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleOpenModal(schedule)}
                  className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(schedule.id)}
                  className="flex-1 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Community */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Community/Parish <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="community"
                  value={formData.community}
                  onChange={handleFormChange}
                  placeholder="e.g., Downtown Kingston"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Pickup Day */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pickup Day <span className="text-red-600">*</span>
                </label>
                <select
                  name="pickupDay"
                  value={formData.pickupDay}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pickup Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pickup Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {frequencies.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              {/* Truck Route */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Truck Route</label>
                <input
                  type="text"
                  name="truckRoute"
                  value={formData.truckRoute}
                  onChange={handleFormChange}
                  placeholder="e.g., Route A - Downtown"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingSchedule ? "Update Schedule" : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Schedule?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this schedule? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}