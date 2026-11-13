import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../firebase.ts';
import { useSiteContent } from '../../context/SiteContentContext.tsx';
import type { StoredOrder } from '../../types/cms.ts';
import { formatWhatsAppUrl } from '../../utils/academicCalculations.ts';
import {
  Clock,
  Trash2,
  Download,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Inbox,
} from 'lucide-react';

interface OrdersManagerProps {
  authToken: string | null;
  brandArabicName: string;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ authToken, brandArabicName }) => {
  const { firebaseUser, isFirebaseAuthReady } = useSiteContent();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    return headers;
  };

  const fetchOrders = useCallback(async () => {
    if (firebaseUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        credentials: 'include',
        cache: 'no-store',
      });
      const data = (await res.json()) as { orders?: StoredOrder[]; error?: string };
      if (!res.ok) {
        setError(data.error || 'تعذر تحميل قائمة الطلبات.');
      } else {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      }
    } catch {
      setError('تعذر الاتصال بالخادم لجلب الطلبات.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, firebaseUser]);

  useEffect(() => {
    if (!isFirebaseAuthReady) return;

    if (firebaseUser) {
      setIsLoading(true);
      setError(null);
      const ordersQuery = query(collection(db, 'orders'), orderBy('submittedAt', 'desc'));
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const loaded = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Partial<StoredOrder>;
            return {
              id: data.id || docSnap.id,
              studentName: data.studentName || '',
              phone: data.phone || '',
              email: data.email || '',
              academicLevel: data.academicLevel || 'master',
              serviceId: data.serviceId || '',
              specialization: data.specialization || '',
              deadline: data.deadline || '',
              notes: data.notes || '',
              createdAt: data.createdAt || '',
              status: data.status || 'جديد',
            } as StoredOrder;
          });
          setOrders(loaded);
          setIsLoading(false);
        },
        (err) => {
          setIsLoading(false);
          setError('تعذر تحميل الطلبات من Firestore.');
          try {
            handleFirestoreError(err, OperationType.LIST, 'orders');
          } catch {
            // logged via handleFirestoreError
          }
        }
      );
      return () => unsubscribe();
    }

    fetchOrders();
  }, [fetchOrders, firebaseUser, isFirebaseAuthReady]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

    if (firebaseUser) {
      const orderPath = `orders/${orderId}`;
      try {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      } catch (err) {
        setError('تعذر تحديث حالة الطلب في Firestore.');
        try {
          handleFirestoreError(err, OperationType.UPDATE, orderPath);
        } catch {
          // logged via handleFirestoreError
        }
      }
      if (!authToken) return;
    }

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = (await res.json()) as { orders?: StoredOrder[]; error?: string };
      if (!firebaseUser) {
        if (res.ok && data.orders) {
          setOrders(data.orders);
        } else if (data.error) {
          setError(data.error);
        }
      }
    } catch {
      if (!firebaseUser) {
        setError('تعذر تحديث حالة الطلب على الخادم.');
      }
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setConfirmDeleteId(null);

    if (firebaseUser) {
      const orderPath = `orders/${orderId}`;
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (err) {
        setError('تعذر حذف الطلب من Firestore.');
        try {
          handleFirestoreError(err, OperationType.DELETE, orderPath);
        } catch {
          // logged via handleFirestoreError
        }
      }
      if (!authToken) return;
    }

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = (await res.json()) as { orders?: StoredOrder[]; error?: string };
      if (!firebaseUser) {
        if (res.ok && data.orders) {
          setOrders(data.orders);
        } else if (data.error) {
          setError(data.error);
        }
      }
    } catch {
      if (!firebaseUser) {
        setError('تعذر حذف الطلب من الخادم.');
      }
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      'رقم الطلب',
      'الاسم',
      'الهاتف',
      'البريد',
      'المرحلة',
      'الخدمة',
      'التخصص',
      'الموعد',
      'الحالة',
      'تاريخ التسجيل',
    ];
    const rows = orders.map((o) => [
      o.id,
      `"${(o.studentName || '').replace(/"/g, '""')}"`,
      `"${(o.phone || '').replace(/"/g, '""')}"`,
      `"${(o.email || '').replace(/"/g, '""')}"`,
      o.academicLevel,
      `"${(o.serviceId || '').replace(/"/g, '""')}"`,
      `"${(o.specialization || '').replace(/"/g, '""')}"`,
      o.deadline || '',
      o.status,
      `"${(o.createdAt || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trusted-orders-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const newCount = orders.filter((o) => o.status === 'جديد').length;
  const activeCount = orders.filter((o) => o.status === 'قيد التنفيذ').length;
  const doneCount = orders.filter((o) => o.status === 'تم التسليم').length;

  return (
    <div className="space-y-6">
      {/* Quick Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">إجمالي الطلبات</div>
          <div className="text-2xl font-extrabold text-[#1A3A5C] mt-1 font-mono tabular-nums">
            {orders.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">طلبات جديدة</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 font-mono tabular-nums">
            {newCount}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">قيد التنفيذ</div>
          <div className="text-2xl font-extrabold text-[#2C5F8A] mt-1 font-mono tabular-nums">
            {activeCount}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 font-medium">تم التسليم</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono tabular-nums">
            {doneCount}
          </div>
        </div>
      </div>

      {/* Orders Toolbar & List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {['all', 'جديد', 'قيد التنفيذ', 'تم التسليم'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-[#1A3A5C] text-white'
                    : 'bg-[#F0F5FA] text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? `كافة الطلبات (${orders.length})` : status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchOrders}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-[#F7F9FC] hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={orders.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1A3A5C] bg-[#F0F5FA] hover:bg-[#E2ECF6] border border-[#2C5F8A]/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير CSV / Excel</span>
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#2C5F8A]" />
            <span>جاري تحميل طلبات الباحثين...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs sm:text-sm gap-2">
            <Inbox className="w-8 h-8 text-slate-300" />
            <span>لا توجد طلبات مطابقة في هذا التصنيف حالياً.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const clientWhatsAppUrl = formatWhatsAppUrl(
                order.phone,
                `مرحباً ${order.studentName}، نتواصل معك من إدارة ${brandArabicName} بخصوص طلبك رقم #${order.id} (${order.serviceId}).`
              );
              const isConfirming = confirmDeleteId === order.id;

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-[#F7F9FC] hover:border-[#2C5F8A]/40 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2C5F8A]">#{order.id}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{order.createdAt}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          order.status === 'جديد'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'قيد التنفيذ'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[#1A3A5C]">{order.studentName}</h3>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div>
                        <strong>الخدمة:</strong> {order.serviceId}{' '}
                        {order.specialization && `(${order.specialization})`}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
                        <span className="inline-flex items-center gap-1" dir="ltr">
                          <Phone className="w-3 h-3 text-[#2C5F8A]" />
                          {order.phone}
                        </span>
                        {order.email && (
                          <span className="inline-flex items-center gap-1" dir="ltr">
                            <Mail className="w-3 h-3 text-[#2C5F8A]" />
                            {order.email}
                          </span>
                        )}
                        {order.deadline && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>الموعد المطلوب: {order.deadline}</span>
                          </span>
                        )}
                      </div>
                      {order.notes && <p className="text-slate-600 pt-1 italic">"{order.notes}"</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200/70 shrink-0">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      aria-label={`تحديث حالة الطلب ${order.id}`}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:border-[#2C5F8A]"
                    >
                      <option value="جديد">جديد</option>
                      <option value="قيد التنفيذ">قيد التنفيذ</option>
                      <option value="تم التسليم">تم التسليم</option>
                    </select>

                    <a
                      href={clientWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>واتساب العميل</span>
                    </a>

                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                        >
                          تأكيد الحذف
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 text-[11px] font-medium bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(order.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="حذف السجل"
                        aria-label="حذف السجل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
