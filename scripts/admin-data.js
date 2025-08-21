(function(){
	// Central mock stores (seeded if empty)
	window.mockUsers = Array.isArray(window.mockUsers) ? window.mockUsers : [
		{ id: 201, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'tutor', status: 'active', created_at: '2024-01-15' },
		{ id: 202, name: 'Lisa Brown', email: 'lisa.brown@email.com', role: 'tutor', status: 'pending', created_at: '2024-02-15' },
		{ id: 101, name: 'Mike Chen', email: 'mike.chen@email.com', role: 'student', status: 'active', created_at: '2024-02-03' },
		{ id: 102, name: 'Emily Davis', email: 'emily.d@email.com', role: 'tutor', status: 'blocked', created_at: '2024-01-20' }
	];
	window.mockRequests = Array.isArray(window.mockRequests) ? window.mockRequests : [
		{ id: 1, student_id: 101, subject: 'Mathematics', class: 'Grade 10', location: 'Dhaka', salary_range: '৳700-900', tuition_type: 'Home Tuition', status: 'open', created_at: '2024-02-20' },
		{ id: 2, student_id: 101, subject: 'Physics', class: 'Grade 11', location: 'Chittagong', salary_range: '৳900-1100', tuition_type: 'Online', status: 'open', created_at: '2024-02-18' },
		{ id: 3, student_id: 102, subject: 'English Literature', class: 'Grade 10', location: 'Dhaka', salary_range: '৳600-800', tuition_type: 'Online', status: 'closed', created_at: '2024-02-15' }
	];
	window.mockApplications = Array.isArray(window.mockApplications) ? window.mockApplications : [
		{ id: 5001, request_id: 1, tutor_id: 201, status: 'pending', created_at: '2024-02-20' }
	];
	window.mockMatches = Array.isArray(window.mockMatches) ? window.mockMatches : [
		// { id: 'match-2001', request_id: 1, tutor_id: 201, student_id: 101, created_at: '2024-02-22' }
	];
	window.mockPayments = Array.isArray(window.mockPayments) ? window.mockPayments : [
		{ id: 'pmt-1001', match_id: 'match-2001', request_id: 2, student_id: 101, tutor_id: 201, amount_total: 8000, payment_status: 'received', created_at: '2025-08-15T10:00:00Z' },
		{ id: 'pmt-1002', match_id: 'match-2002', request_id: 3, student_id: 102, tutor_id: 202, amount_total: 12000, payment_status: 'pending', created_at: '2025-08-16T15:00:00Z' }
	];
	window.mockCommissions = Array.isArray(window.mockCommissions) ? window.mockCommissions : [
		{ id: 'comm-9001', payment_id: 'pmt-1001', commission_rate: 0.10, commission_amount: 800, collection_status: 'collected' },
		{ id: 'comm-9002', payment_id: 'pmt-1002', commission_rate: 0.10, commission_amount: 1200, collection_status: 'pending' }
	];
	window.mockReports = Array.isArray(window.mockReports) ? window.mockReports : [
		{ id: 'rep-3001', reporter_id: 301, reported_user_id: 202, content_id: 'msg-900', reason: 'Harassment', details: 'Rude messages', status: 'pending', created_at: '2024-02-21' },
		{ id: 'rep-3002', reporter_id: 302, reported_user_id: 201, content_id: 'profile-201', reason: 'Fake credentials', details: 'Certificate mismatch', status: 'resolved', created_at: '2024-02-19', resolved_at: '2024-02-20' }
	];

	function generateId(prefix){
		return `${prefix}-${Math.random().toString(36).slice(2,8)}-${Date.now().toString().slice(-4)}`;
	}

	// USERS
	async function fetchUsers(filters){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				let query = supabase.from('profiles').select('id, name, email, role, status, created_at').in('role', ['student','tutor']);
				if (filters?.role) query = query.eq('role', filters.role);
				if (filters?.status) query = query.eq('status', filters.status);
				if (filters?.q) {
					const q = filters.q.toLowerCase();
					query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
				}
				const { data, error } = await query.order('created_at', { ascending: false });
				if (error) throw error;
				return data || [];
			}
		} catch (error) {
			console.error('Error fetching users from Supabase:', error);
			alert('Failed to fetch users from database. Using offline data.');
		}
		
		// Fallback to mock data
		let users = [...window.mockUsers];
		if (filters?.role) users = users.filter(u => u.role === filters.role);
		if (filters?.status) users = users.filter(u => u.status === filters.status);
		if (filters?.q){
			const q = filters.q.toLowerCase();
			users = users.filter(u => u.name.toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q));
		}
		return users;
	}

	async function approveTutor(userId){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				const { data, error } = await supabase
					.from('profiles')
					.update({ status: 'active' })
					.eq('id', userId)
					.eq('role', 'tutor')
					.select()
					.single();
				if (error) throw error;
				return data;
			}
		} catch (error) {
			console.error('Error approving tutor in Supabase:', error);
			alert('Failed to approve tutor in database. Using offline mode.');
		}
		
		// Fallback to mock data
		const u = window.mockUsers.find(u => u.id === userId);
		if (u && u.role === 'tutor') u.status = 'active';
		return u;
	}

	async function toggleBlockUser(userId){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				// First get current status
				const { data: currentUser, error: fetchError } = await supabase
					.from('profiles')
					.select('status')
					.eq('id', userId)
					.single();
				if (fetchError) throw fetchError;
				
				const newStatus = currentUser.status === 'blocked' ? 'active' : 'blocked';
				const { data, error } = await supabase
					.from('profiles')
					.update({ status: newStatus })
					.eq('id', userId)
					.select()
					.single();
				if (error) throw error;
				return data;
			}
		} catch (error) {
			console.error('Error toggling user block status in Supabase:', error);
			alert('Failed to update user status in database. Using offline mode.');
		}
		
		// Fallback to mock data
		const u = window.mockUsers.find(u => u.id === userId);
		if (!u) return null;
		u.status = u.status === 'blocked' ? 'active' : 'blocked';
		return u;
	}

	async function getUserById(userId){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				const { data, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', userId)
					.single();
				if (error) throw error;
				return data;
			}
		} catch (error) {
			console.error('Error fetching user by ID from Supabase:', error);
		}
		
		// Fallback to mock data
		return window.mockUsers.find(u => u.id === userId) || null;
	}

	// REQUESTS
	async function fetchRequests(filters){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				let query = supabase.from('requests').select('*');
				if (filters?.status) query = query.eq('status', filters.status);
				if (filters?.subject) query = query.eq('subject', filters.subject);
				if (filters?.location) query = query.eq('location', filters.location);
				const { data, error } = await query.order('created_at', { ascending: false });
				if (error) throw error;
				return data || [];
			}
		} catch (error) {
			console.error('Error fetching requests from Supabase:', error);
			alert('Failed to fetch requests from database. Using offline data.');
		}
		
		// Fallback to mock data
		let reqs = [...window.mockRequests];
		if (filters?.status) reqs = reqs.filter(r => r.status === filters.status);
		if (filters?.subject) reqs = reqs.filter(r => r.subject === filters.subject);
		if (filters?.location) reqs = reqs.filter(r => r.location === filters.location);
		return reqs;
	}

	async function editRequest(id, changes){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				const { data, error } = await supabase
					.from('requests')
					.update(changes)
					.eq('id', id)
					.select()
					.single();
				if (error) throw error;
				return data;
			}
		} catch (error) {
			console.error('Error editing request in Supabase:', error);
			alert('Failed to update request in database. Using offline mode.');
		}
		
		// Fallback to mock data
		const r = window.mockRequests.find(r => r.id === id);
		if (!r) return null;
		Object.assign(r, changes || {});
		return r;
	}

	async function closeRequest(id){
		return editRequest(id, { status: 'closed' });
	}

	async function deleteRequest(id){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				const { error } = await supabase
					.from('requests')
					.delete()
					.eq('id', id);
				if (error) throw error;
				return true;
			}
		} catch (error) {
			console.error('Error deleting request in Supabase:', error);
			alert('Failed to delete request from database. Using offline mode.');
		}
		
		// Fallback to mock data
		const idx = window.mockRequests.findIndex(r => r.id === id);
		if (idx >= 0) window.mockRequests.splice(idx, 1);
		return true;
	}

	async function assignTutorToRequest(requestId, tutorId){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				// First get the request to find student_id
				const { data: req, error: reqError } = await supabase
					.from('requests')
					.select('student_id')
					.eq('id', requestId)
					.single();
				if (reqError) throw reqError;
				
				const match = {
					request_id: requestId,
					tutor_id: tutorId,
					student_id: req.student_id,
					created_at: new Date().toISOString()
				};
				
				const { data, error } = await supabase
					.from('matches')
					.insert(match)
					.select()
					.single();
				if (error) throw error;
				return data;
			}
		} catch (error) {
			console.error('Error assigning tutor to request in Supabase:', error);
			alert('Failed to assign tutor in database. Using offline mode.');
		}
		
		// Fallback to mock data
		const req = window.mockRequests.find(r => r.id === requestId);
		const studentId = req?.student_id;
		const match = { id: generateId('match'), request_id: requestId, tutor_id: tutorId, student_id: studentId, created_at: new Date().toISOString() };
		window.mockMatches.push(match);
		return match;
	}

	// REPORTS
	async function fetchReports(filters){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				let query = supabase.from('reports').select('*');
				if (filters?.status) query = query.eq('status', filters.status);
				if (filters?.reason) query = query.eq('reason', filters.reason);
				const { data, error } = await query.order('created_at', { ascending: false });
				if (error) throw error;
				return data || [];
			}
		} catch (error) {
			console.error('Error fetching reports from Supabase:', error);
		}
		
		// Fallback to mock data
		let reports = [...window.mockReports];
		if (filters?.status) reports = reports.filter(r => r.status === filters.status);
		if (filters?.reason) reports = reports.filter(r => r.reason === filters.reason);
		return reports;
	}

	async function resolveReport(reportId){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				const { data, error } = await supabase
					.from('reports')
					.update({ 
						status: 'resolved',
						resolved_at: new Date().toISOString()
					})
					.eq('id', reportId)
					.select()
					.single();
				if (error) throw error;
				return data;
			}
		} catch (error) {
			console.error('Error resolving report in Supabase:', error);
			alert('Failed to resolve report in database. Using offline mode.');
		}
		
		// Fallback to mock data
		const r = window.mockReports.find(r => r.id === reportId);
		if (!r) return null;
		r.status = 'resolved';
		r.resolved_at = new Date().toISOString();
		return r;
	}

	async function blockUser(userId){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				const { data, error } = await supabase
					.from('profiles')
					.update({ status: 'blocked' })
					.eq('id', userId)
					.select()
					.single();
				if (error) throw error;
				return data;
			}
		} catch (error) {
			console.error('Error blocking user in Supabase:', error);
			alert('Failed to block user in database. Using offline mode.');
		}
		// Fallback to mock data
		const u = window.mockUsers.find(u => u.id === userId);
		if (!u) return null;
		u.status = 'blocked';
		return u;
	}

	// PAYMENTS / COMMISSIONS / ANALYTICS
	async function addPayment(payment){
		// Implement using invoices as the canonical payments source
		const base = payment || {};
		const amount = Number(base.amount_total || base.amount || 0) || 0;
		const commission_rate = 0.10;
		const commission_amount = Math.round(amount * commission_rate);
		const nowIso = new Date().toISOString();
		// invoices required/known columns
		const invoiceRow = {
			session_id: base.session_id || null,
			student_id: base.student_id || null,
			tutor_id: base.tutor_id || null,
			amount: amount,
			status: base.payment_status ? (base.payment_status === 'received' ? 'paid' : base.payment_status) : 'paid',
			due_date: base.due_date || null,
			paid_at: base.paid_at || nowIso,
			created_at: base.created_at || nowIso
		};
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				const { data, error } = await supabase
					.from('invoices')
					.insert(invoiceRow)
					.select('*')
					.single();
				if (error) throw error;
				// Return object mapped to payments shape, enriching with commission fields (not persisted unless schema extended)
				return {
					...data,
					amount_total: data.amount,
					payment_status: data.status,
					commission_rate,
					commission_amount,
					commission_status: base.commission_status || 'pending'
				};
			}
		} catch (error) {
			console.error('Error inserting invoice into Supabase:', error);
			alert('Failed to insert invoice into database. Using offline mode.');
		}
		// Fallback to mock data (payments-like store)
		const id = generateId('inv');
		const mock = {
			id,
			...invoiceRow,
			amount_total: invoiceRow.amount,
			payment_status: invoiceRow.status,
			commission_rate,
			commission_amount,
			commission_status: base.commission_status || 'pending'
		};
		window.mockPayments = Array.isArray(window.mockPayments) ? window.mockPayments : [];
		window.mockPayments.push(mock);
		return mock;
	}

	async function fetchPayments(){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				const { data, error } = await supabase
					.from('invoices')
					.select('*')
					.order('created_at', { ascending: false });
				if (error) throw error;
				return (data || []).map(inv => {
					const rate = typeof inv.commission_rate === 'number' ? inv.commission_rate : 0.10;
					const amt = typeof inv.commission_amount === 'number' ? inv.commission_amount : Math.round((Number(inv.amount||0)) * rate);
					return {
						...inv,
						amount_total: inv.amount,
						payment_status: inv.status,
						commission_rate: rate,
						commission_amount: amt,
						commission_status: inv.commission_status || 'pending'
					};
				});
			}
		} catch (error) {
			console.error('Error fetching invoices from Supabase:', error);
		}
		
		// Fallback to mock data
		return (window.mockPayments || []).map(p => {
			const rate = typeof p.commission_rate === 'number' ? p.commission_rate : 0.10;
			const amt = typeof p.commission_amount === 'number' ? p.commission_amount : Math.round((Number(p.amount_total||0)) * rate);
			let status = p.commission_status;
			if (!status) {
				const comm = (window.mockCommissions || []).find(c => c.payment_id === p.id);
				status = comm ? comm.collection_status : 'pending';
			}
			return { ...p, commission_rate: rate, commission_amount: amt, commission_status: status };
		});
	}

	async function markCommissionCollected(paymentId){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				// Attempt to update commission fields on invoices
				const { data, error } = await supabase
					.from('invoices')
					.update({ 
						commission_status: 'collected',
						commission_collected_at: new Date().toISOString()
					})
					.eq('id', paymentId)
					.select('*')
					.single();
				if (error) throw error;
				return {
					...data,
					amount_total: data.amount,
					payment_status: data.status
				};
			}
		} catch (error) {
			console.error('Error marking commission collected in Supabase (invoices):', error);
			alert('Failed to update commission status in database. Using offline mode.');
		}
		
		// Fallback to mock data
		// Update in mockPayments first
		const p = (window.mockPayments || []).find(x => x.id === paymentId);
		if (p) {
			p.commission_status = 'collected';
			p.commission_collected_at = new Date().toISOString();
			return p;
		}
		// If legacy mockCommissions is used, update it too
		const comm = (window.mockCommissions || []).find(c => c.payment_id === paymentId);
		if (comm) {
			comm.collection_status = 'collected';
			comm.collected_at = new Date().toISOString();
			return comm;
		}
		return null;
	}

	async function getAnalyticsSummary(){
		try {
			const supabase = window.getSupabaseClient();
			if (supabase) {
				// Get user counts
				const { count: totalUsers } = await supabase.from('profiles').select('id', { count: 'exact' });
				const { count: totalTutors } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'tutor');
				const { count: totalStudents } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student');
				const { count: pendingTutors } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'tutor').eq('status', 'pending');
				
				// Get request counts
				const { count: openRequests } = await supabase.from('requests').select('id', { count: 'exact' }).eq('status', 'open');
				
				// Get report counts
				const { count: pendingReports } = await supabase.from('reports').select('id', { count: 'exact' }).eq('status', 'pending');
				
				// Get payment data
				const payments = await fetchPayments();
				const totalPayments = payments.length;
				const commissionPending = payments.filter(p => p.commission_status === 'pending').reduce((s,p)=>s+(p.commission_amount||0),0);
				const commissionCollected = payments.filter(p => p.commission_status === 'collected').reduce((s,p)=>s+(p.commission_amount||0),0);
				
				// Monthly commission grouping
				const monthKey = d => (d.created_at||'').slice(0,7);
				const commissionByMonth = payments.reduce((acc,p)=>{ const k = monthKey(p)||'N/A'; acc[k]=(acc[k]||0)+(p.commission_amount||0); return acc; },{});
				
				return {
					counts: {
						totalUsers: totalUsers || 0,
						totalTutors: totalTutors || 0,
						totalStudents: totalStudents || 0,
						pendingTutors: pendingTutors || 0,
						openRequests: openRequests || 0,
						pendingReports: pendingReports || 0,
						totalPayments,
						commissionPending,
						commissionCollected
					},
					charts: {
						commissionByMonth
					}
				};
			}
		} catch (error) {
			console.error('Error fetching analytics from Supabase:', error);
		}
		
		// Fallback to mock data
		const users = window.mockUsers || [];
		const requests = window.mockRequests || [];
		const reports = window.mockReports || [];
		const payments = await fetchPayments();
		const tutors = users.filter(u => u.role === 'tutor');
		const students = users.filter(u => u.role === 'student');
		const pendingTutors = tutors.filter(u => u.status === 'pending').length;
		const openRequests = requests.filter(r => r.status === 'open').length;
		const pendingReports = reports.filter(r => r.status === 'pending').length;
		const totalPayments = payments.length;
		const commissionPending = payments.filter(p => p.commission_status === 'pending').reduce((s,p)=>s+(p.commission_amount||0),0);
		const commissionCollected = payments.filter(p => p.commission_status === 'collected').reduce((s,p)=>s+(p.commission_amount||0),0);
		// Simple monthly grouping
		const monthKey = d => (d.created_at||'').slice(0,7);
		const commissionByMonth = payments.reduce((acc,p)=>{ const k = monthKey(p)||'N/A'; acc[k]=(acc[k]||0)+(p.commission_amount||0); return acc; },{});
		return {
			counts: {
				totalUsers: users.length,
				totalTutors: tutors.length,
				totalStudents: students.length,
				pendingTutors,
				openRequests,
				pendingReports,
				totalPayments,
				commissionPending,
				commissionCollected
			},
			charts: {
				commissionByMonth
			}
		};
	}

	// Expose API
	window.AdminData = {
		fetchUsers, approveTutor, toggleBlockUser, getUserById,
		fetchRequests, editRequest, closeRequest, deleteRequest, assignTutorToRequest,
		fetchReports, resolveReport, blockUser,
		addPayment, fetchPayments, markCommissionCollected, getAnalyticsSummary
	};
})();
