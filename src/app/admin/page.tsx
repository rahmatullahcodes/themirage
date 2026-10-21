'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Crown,
  CreditCard,
  AlertTriangle,
  Settings,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  DollarSign,
  TrendingUp,
  Search,
  RotateCcw,
  Clock,
  Activity,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';
import { calculateCommission } from '@/lib/commission';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Configurable commission state (Requirement 2 & 14 & 17)
  const [creatorCommission, setCreatorCommission] = useState(85);
  const [platformCommission, setPlatformCommission] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Platform metrics
  const totalGross = 38450.00;
  const metrics = calculateCommission(totalGross, creatorCommission);

  // Demo users
  const [users, setUsers] = useState([
    { id: 'u1', name: 'Sophie Lee', email: 'sophie@themirage.vip', role: 'CREATOR', status: 'ACTIVE', joined: 'Oct 12, 2026' },
    { id: 'u2', name: 'Luna Rae', email: 'luna@themirage.vip', role: 'CREATOR', status: 'ACTIVE', joined: 'Oct 08, 2026' },
    { id: 'u3', name: 'Alex Mercer', email: 'alex@example.com', role: 'SUBSCRIBER', status: 'ACTIVE', joined: 'Oct 14, 2026' },
    { id: 'u4', name: 'John Doe', email: 'john@example.com', role: 'SUBSCRIBER', status: 'SUSPENDED', joined: 'Oct 10, 2026' },
  ]);

  // Demo creators with verification toggle
  const [creators, setCreators] = useState([
    { id: 'c1', name: 'Luna Rae', handle: '@luna-rae', isVerified: true, monthlyPrice: 9.99, earnings: 14200.00, subscribers: 428, status: 'ACTIVE' },
    { id: 'c2', name: 'Mia Carter', handle: '@mia-carter', isVerified: true, monthlyPrice: 7.99, earnings: 9800.00, subscribers: 310, status: 'ACTIVE' },
    { id: 'c3', name: 'Zara Khan', handle: '@zara-khan', isVerified: false, monthlyPrice: 12.99, earnings: 4500.00, subscribers: 195, status: 'ACTIVE' },
    { id: 'c4', name: 'Aria Vance', handle: '@aria-vance', isVerified: false, monthlyPrice: 10.99, earnings: 1200.00, subscribers: 84, status: 'ACTIVE' },
  ]);

  // Demo reports
  const [reports, setReports] = useState([
    { id: 'rep-1', reporter: 'Alex Mercer', reason: 'Copyright Rights Question', status: 'PENDING', post: 'Exclusive Stage Set', date: 'Oct 20, 2026' },
    { id: 'rep-2', reporter: 'System Gate', reason: 'Age verification declaration check', status: 'RESOLVED', post: 'Feed Post #41', date: 'Oct 19, 2026' },
  ]);

  // Demo transactions
  const [txSearch, setTxSearch] = useState('');
  const [transactions, setTransactions] = useState([
    {
      id: 'tx-1001',
      ref: 'MIRAGE_SUB_9941',
      user: 'alexmercer',
      creator: 'Luna Rae',
      type: 'SUBSCRIPTION',
      amount: 9.99,
      creatorShare: 8.49,
      platformShare: 1.50,
      status: 'SUCCESS',
      date: 'Oct 21, 2026, 11:45 AM',
    },
    {
      id: 'tx-1002',
      ref: 'MIRAGE_CUST_8832',
      user: 'alexmercer',
      creator: 'Luna Rae',
      type: 'CUSTOM_CONTENT',
      amount: 35.00,
      creatorShare: 29.75,
      platformShare: 5.25,
      status: 'SUCCESS',
      date: 'Oct 21, 2026, 11:46 AM',
    },
    {
      id: 'tx-1003',
      ref: 'MIRAGE_SUB_7721',
      user: 'marcus_w',
      creator: 'Sophie Lee',
      type: 'SUBSCRIPTION',
      amount: 9.99,
      creatorShare: 8.49,
      platformShare: 1.50,
      status: 'SUCCESS',
      date: 'Oct 20, 2026, 04:12 PM',
    },
    {
      id: 'tx-1004',
      ref: 'MIRAGE_SUB_6619',
      user: 'david_k',
      creator: 'Mia Carter',
      type: 'SUBSCRIPTION',
      amount: 7.99,
      creatorShare: 6.79,
      platformShare: 1.20,
      status: 'REFUNDED',
      date: 'Oct 19, 2026, 09:30 AM',
    },
  ]);

  const handleToggleVerification = (creatorId: string) => {
    setCreators(prev =>
      prev.map(c => (c.id === creatorId ? { ...c, isVerified: !c.isVerified } : c))
    );
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : u
      )
    );
  };

  const handleIssueRefund = (txId: string) => {
    if (confirm(`Are you sure you want to issue an administrative refund for ${txId}?`)) {
      setTransactions(prev =>
        prev.map(t => (t.id === txId ? { ...t, status: 'REFUNDED' } : t))
      );
      alert(`Refund processed for transaction ${txId}. Customer ledger updated.`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const filteredTx = transactions.filter(t =>
    t.ref.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.user.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.creator.toLowerCase().includes(txSearch.toLowerCase())
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Administration Dashboard';
      case 'creators':
        return 'Creator Management & Verification';
      case 'users':
        return 'User Accounts & Access Permissions';
      case 'transactions':
        return 'Transactions & 85/15 Commission Ledger';
      case 'moderation':
        return 'Content Moderation & Review Queue';
      case 'settings':
        return 'Platform Commission Configuration';
      default:
        return 'Administration Panel';
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex">
      {/* Sidebar with Toggle Bar */}
      <PanelSidebar
        role="ADMIN"
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        userName="Super Admin"
        userHandle="admin@themirage.vip"
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Panel Header with Mobile Toggle Bar */}
        <PanelHeader
          title={getTabTitle()}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          role="ADMIN"
        />

        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* 4 Financial & User KPI Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#101016] border border-[#20202c]">
              <div className="flex justify-between text-xs text-[#7e7e90] mb-2">
                <span>Gross Platform Volume</span>
                <DollarSign className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">${totalGross.toFixed(2)}</div>
              <div className="text-[10px] text-green-400 mt-1">+18.4% this month</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#101016] border border-[#20202c]">
              <div className="flex justify-between text-xs text-[#7e7e90] mb-2">
                <span>Creator Payouts ({creatorCommission}%)</span>
                <Crown className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#f5d77f]">
                ${metrics.creatorShare.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#555566] mt-1">Directly allocated to creators</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#101016] border border-[#20202c]">
              <div className="flex justify-between text-xs text-[#7e7e90] mb-2">
                <span>Platform Net Revenue ({platformCommission}%)</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">
                ${metrics.platformShare.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#555566] mt-1">15% platform maintenance fee</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#101016] border border-[#20202c]">
              <div className="flex justify-between text-xs text-[#7e7e90] mb-2">
                <span>Total Active Users</span>
                <Users className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">{users.length * 128}</div>
              <div className="text-[10px] text-[#555566] mt-1">Verified subscribers & creators</div>
            </div>
          </div>

          {/* Tab 1: Live Overview & Audit Logs */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#111117] border border-[#232330] space-y-4">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#f5d77f]" />
                  Recent Platform Events
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#161622] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>New Subscription: alexmercer subscribed to Luna Rae ($9.99/mo)</span>
                    </div>
                    <span className="text-[10px] text-[#6e6e80]">5m ago</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161622] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Crown className="w-4 h-4 text-[#f5d77f]" />
                      <span>Custom Content Delivered: Luna Rae delivered order to alexmercer ($35.00)</span>
                    </div>
                    <span className="text-[10px] text-[#6e6e80]">15m ago</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#161622] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Creator Verification Granted: Mia Carter approved for verified checkmark</span>
                    </div>
                    <span className="text-[10px] text-[#6e6e80]">1h ago</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111117] border border-[#232330] space-y-4">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#f5d77f]" />
                  Financial Health & 85/15 Integrity
                </h3>
                <p className="text-xs text-[#8c8c9e] leading-relaxed">
                  The platform operates with automated idempotency checks and zero unauthorized payouts. The 85/15 creator revenue split is audited in real-time across all payment gateways.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#161622] text-center">
                    <div className="text-xl font-bold font-serif text-[#f5d77f]">85.0%</div>
                    <span className="text-[10px] text-[#808092]">Creator Allocation</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#161622] text-center">
                    <div className="text-xl font-bold font-serif text-white">15.0%</div>
                    <span className="text-[10px] text-[#808092]">Platform Cut</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Creators & Verification */}
          {activeTab === 'creators' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Creator Verification & Status</h3>
                  <p className="text-xs text-[#8c8c9e]">Grant or revoke official verification checkmarks and inspect creator earnings.</p>
                </div>
              </div>
              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">Creator</th>
                      <th className="py-3 px-4">Handle</th>
                      <th className="py-3 px-4">Monthly Price</th>
                      <th className="py-3 px-4">Subscribers</th>
                      <th className="py-3 px-4">Total Earnings</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {creators.map((c) => (
                      <tr key={c.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-bold flex items-center gap-1.5">
                          {c.name}
                          {c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black" />}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#94a3b8]">{c.handle}</td>
                        <td className="py-3.5 px-4">${c.monthlyPrice.toFixed(2)}/mo</td>
                        <td className="py-3.5 px-4">{c.subscribers}</td>
                        <td className="py-3.5 px-4 text-[#f5d77f] font-semibold">${c.earnings.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isVerified
                              ? 'bg-green-950/60 text-green-400 border border-green-500/30'
                              : 'bg-[#201d15] text-[#8e8e9e] border border-[#353020]'
                          }`}>
                            {c.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleVerification(c.id)}
                            className="px-3 py-1 rounded-lg bg-[#181824] hover:bg-[#202030] text-[11px] text-[#cbd5e1] border border-[#2f2f40]"
                          >
                            {c.isVerified ? 'Revoke Badge' : 'Grant Verified'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: User Management */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Registered User Accounts</h3>
                <p className="text-xs text-[#8c8c9e]">Manage access status, suspend violators, and monitor account registration details.</p>
              </div>
              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-bold">{u.name}</td>
                        <td className="py-3.5 px-4 text-[#8a8a9e]">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#181826] text-[#d4af37] border border-[#d4af37]/20 text-[10px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#717182]">{u.joined}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="px-3 py-1 rounded-lg bg-[#181824] hover:bg-[#202030] text-[11px] text-[#cbd5e1] border border-[#2f2f40]"
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Transactions Ledger & Refund Admin */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Financial Transactions & Audit Ledger</h3>
                  <p className="text-xs text-[#8c8c9e]">Inspect real-time 85/15 commission cuts and issue administrative refunds.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#666677] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    placeholder="Search reference, user..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#161622] border border-[#282838] rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Creator</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Gross</th>
                      <th className="py-3 px-4">Creator 85%</th>
                      <th className="py-3 px-4">Platform 15%</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {filteredTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-mono text-[#a0a0b2]">{tx.ref}</td>
                        <td className="py-3.5 px-4 font-medium">{tx.user}</td>
                        <td className="py-3.5 px-4 text-[#f5d77f] font-semibold">{tx.creator}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#181826] text-[10px] text-[#cbd5e1] border border-[#2b2b3a]">
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">${tx.amount.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-green-400 font-semibold">${tx.creatorShare.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-[#a0a0b2]">${tx.platformShare.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'SUCCESS' ? 'text-green-400 bg-green-950/60' : 'text-red-400 bg-red-950/60'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {tx.status === 'SUCCESS' ? (
                            <button
                              onClick={() => handleIssueRefund(tx.id)}
                              className="px-2.5 py-1 rounded bg-[#251515] hover:bg-[#301818] text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Refund
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#606070]">Refunded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Content Moderation */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Reported Content Queue</h3>
                <p className="text-xs text-[#8c8c9e]">Review copyright, consent, or violation reports submitted by users or automated gates.</p>
              </div>
              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">Report ID</th>
                      <th className="py-3 px-4">Reporter</th>
                      <th className="py-3 px-4">Target Post</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-mono text-[#94a3b8]">{r.id}</td>
                        <td className="py-3.5 px-4 font-medium">{r.reporter}</td>
                        <td className="py-3.5 px-4">{r.post}</td>
                        <td className="py-3.5 px-4 text-yellow-400">{r.reason}</td>
                        <td className="py-3.5 px-4 font-bold">{r.status}</td>
                        <td className="py-3.5 px-4 flex gap-2">
                          <button
                            onClick={() => {
                              setReports(prev => prev.filter(item => item.id !== r.id));
                              alert('Post approved & report dismissed');
                            }}
                            className="px-2.5 py-1 rounded bg-[#181824] text-[10px] text-green-400 border border-green-500/30"
                          >
                            Approve Post
                          </button>
                          <button
                            onClick={() => {
                              setReports(prev => prev.filter(item => item.id !== r.id));
                              alert('Post removed for policy violation');
                            }}
                            className="px-2.5 py-1 rounded bg-[#251515] text-[10px] text-red-400 border border-red-500/30"
                          >
                            Remove Post
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 6: Commission Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#d4af37]/40 space-y-6">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#f5d77f]" />
                Platform Revenue Split Configuration
              </h3>
              <p className="text-xs text-[#8c8c9e]">
                Configure the revenue split dynamically. The agreed standard is <span className="text-[#f5d77f] font-bold">85% to Creator</span> and <span className="text-white font-bold">15% to Platform</span>.
              </p>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Revenue split configuration updated across all backend calculation engines!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b2] mb-1">
                    Creator Share Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={creatorCommission}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setCreatorCommission(val);
                      setPlatformCommission(100 - val);
                    }}
                    className="w-full px-4 py-2.5 bg-[#181824] border border-[#2d2d3e] rounded-xl text-sm text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b2] mb-1">
                    Platform Fee Percentage (%)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={platformCommission}
                    className="w-full px-4 py-2.5 bg-[#14141e] border border-[#22222e] rounded-xl text-sm text-[#7e7e90] font-bold"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#151520] border border-[#262638] text-xs space-y-1">
                  <div className="text-white font-semibold">Simulated Sample ($100.00 Transaction):</div>
                  <div className="text-[#f5d77f]">Creator Payout: ${(100 * creatorCommission / 100).toFixed(2)}</div>
                  <div className="text-[#94a3b8]">Platform Cut: ${(100 * platformCommission / 100).toFixed(2)}</div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm"
                >
                  Save Commission Policy
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
