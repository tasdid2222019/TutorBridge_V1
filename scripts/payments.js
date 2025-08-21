(function () {
	// Initialize global mock stores if not already present
	const existingPayments = Array.isArray(window.mockPayments) ? window.mockPayments : [];
	const existingCommissions = Array.isArray(window.mockCommissions) ? window.mockCommissions : [];

	// Preload sample mock data (if not already provided elsewhere)
	if (existingPayments.length === 0) {
		window.mockPayments = [
			{
				id: "pmt-1001",
				match_id: "match-2001",
				request_id: 2,
				student_id: 101,
				tutor_id: 201,
				amount_total: 8000,
				payment_status: "received",
				created_at: "2025-08-15T10:00:00Z"
			},
			{
				id: "pmt-1002",
				match_id: "match-2002",
				request_id: 3,
				student_id: 102,
				tutor_id: 202,
				amount_total: 12000,
				payment_status: "pending",
				created_at: "2025-08-16T15:00:00Z"
			}
		];
	} else {
		window.mockPayments = existingPayments;
	}

	if (existingCommissions.length === 0) {
		window.mockCommissions = [
			{
				id: "comm-9001",
				payment_id: "pmt-1001",
				commission_rate: 0.10,
				commission_amount: 800,
				collection_status: "collected"
			},
			{
				id: "comm-9002",
				payment_id: "pmt-1002",
				commission_rate: 0.10,
				commission_amount: 1200,
				collection_status: "pending"
			}
		];
	} else {
		window.mockCommissions = existingCommissions;
	}

	function generateId(prefix) {
		return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString().slice(-4)}`;
	}

	function createCommissionForPayment(payment, rate = 0.10) {
		const commissionAmount = Math.round((payment.amount_total || 0) * rate);
		const commission = {
			id: generateId('comm'),
			payment_id: payment.id,
			commission_rate: rate,
			commission_amount: commissionAmount,
			collection_status: 'pending'
		};
		window.mockCommissions.push(commission);
		return commission;
	}

	/**
	 * Create a payment record (Supabase-first, fallback to mock)
	 * @param {string} matchId
	 * @param {number|string} studentId
	 * @param {number|string} tutorId
	 * @param {number} amount
	 * @param {{ requestId?: number|string, status?: 'pending'|'received'|'confirmed' }} [options]
	 */
	async function createPayment(matchId, studentId, tutorId, amount, options) {
		const opts = options || {};
		try {
			const supabase = window.getSupabaseClient?.();
			if (supabase) {
				const payload = {
					match_id: matchId || null,
					student_id: studentId,
					tutor_id: tutorId,
					request_id: opts.requestId ?? null,
					amount: Number(amount) || 0,
					status: opts.status || 'pending',
					commission_rate: 0.10,
					commission_status: 'pending'
				};
				const { data, error } = await supabase
					.from('invoices')
					.insert(payload)
					.select('*')
					.single();
				if (error) throw error;
				const rate = typeof data.commission_rate === 'number' ? data.commission_rate : 0.10;
				const commissionAmount = typeof data.commission_amount === 'number' ? data.commission_amount : Math.round((Number(data.amount||0)) * rate);
				return {
					...data,
					amount_total: data.amount,
					payment_status: data.status,
					commission_amount: commissionAmount,
					commission_rate: rate,
					commission_status: data.commission_status || 'pending'
				};
			}
		} catch (e) {
			console.warn('createPayment Supabase failed, using fallback:', e);
			alert('Could not create payment in database. Using offline mode.');
		}

		// Fallback to mock
		const payment = {
			id: generateId('pmt'),
			match_id: matchId,
			student_id: studentId,
			tutor_id: tutorId,
			amount_total: Number(amount) || 0,
			payment_status: opts.status || 'pending',
			created_at: new Date().toISOString()
		};
		if (opts.requestId != null) payment.request_id = opts.requestId;
		window.mockPayments.push(payment);
		if (payment.payment_status === 'received' || payment.payment_status === 'confirmed') {
			createCommissionForPayment(payment, 0.10);
		}
		return payment;
	}

	/**
	 * Mark an existing payment as received and create/update commission if needed (Supabase-first)
	 * @param {string|number} paymentId
	 * @param {number} amount Optional override of amount
	 */
	async function markPaymentReceived(paymentId, amount) {
		try {
			const supabase = window.getSupabaseClient?.();
			if (supabase) {
				const updates = { status: 'received' };
				if (amount != null) updates.amount = Number(amount) || 0;
				const { data, error } = await supabase
					.from('invoices')
					.update(updates)
					.eq('id', paymentId)
					.select('*')
					.single();
				if (error) throw error;
				const rate = typeof data.commission_rate === 'number' ? data.commission_rate : 0.10;
				const commissionAmount = typeof data.commission_amount === 'number' ? data.commission_amount : Math.round((Number(data.amount||0)) * rate);
				return {
					...data,
					amount_total: data.amount,
					payment_status: data.status,
					commission_amount: commissionAmount,
					commission_rate: rate,
					commission_status: data.commission_status || 'pending'
				};
			}
		} catch (e) {
			console.warn('markPaymentReceived Supabase failed, using fallback:', e);
			alert('Failed to update payment in database. Using offline mode.');
		}

		// Fallback to mock
		const payment = window.mockPayments.find(p => p.id === paymentId);
		if (!payment) throw new Error('Payment not found');
		if (amount != null) payment.amount_total = Number(amount) || payment.amount_total;
		payment.payment_status = 'received';
		const existing = window.mockCommissions.find(c => c.payment_id === paymentId);
		if (!existing) {
			createCommissionForPayment(payment, 0.10);
		}
		return payment;
	}

	/**
	 * Mark commission as collected for a payment (Supabase-first, delegate to AdminData if available)
	 * @param {string|number} paymentId
	 */
	async function markCommissionCollected(paymentId) {
		try {
			if (window.AdminData?.markCommissionCollected) {
				return await window.AdminData.markCommissionCollected(paymentId);
			}
		} catch (e) {
			console.warn('Delegation to AdminData.markCommissionCollected failed:', e);
		}

		try {
			const supabase = window.getSupabaseClient?.();
			if (supabase) {
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
		} catch (e) {
			console.warn('markCommissionCollected Supabase failed, using fallback:', e);
			alert('Failed to update commission in database. Using offline mode.');
		}

		// Fallback to mock commissions
		const commission = window.mockCommissions.find(c => c.payment_id === paymentId);
		if (!commission) throw new Error('Commission not found for payment');
		commission.collection_status = 'collected';
		commission.collected_at = new Date().toISOString();
		commission.collected_by = 'admin';
		return commission;
	}

	// Expose API
	window.createPayment = createPayment;
	window.markPaymentReceived = markPaymentReceived;
	window.markCommissionCollected = markCommissionCollected;
})();


