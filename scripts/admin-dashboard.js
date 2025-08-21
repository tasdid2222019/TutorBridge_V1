(function(){
	//function guardAdmin(){
		//const user = window.auth?.getCurrentUser();
		//if (!user || user.role !== 'admin') {
			//alert('Admin access only');
			//window.location.href = '../pages/login.html';
			//return false;
		//}
		//return true;
	//}

	function qs(id){ return document.getElementById(id); }

	// Users Tab
	async function loadUsers(){
		const search = '';
		const users = await window.AdminData.fetchUsers({ q: search });
		renderUsersTable(users);
	}

	function renderUsersTable(users){
		const tbody = document.querySelector('#usersTable tbody');
		if (!tbody) return;
		tbody.innerHTML = '';
		users.forEach(u => {
			const tr = document.createElement('tr');
			const statusClass = u.status === 'active' ? 'status-active' : u.status === 'blocked' ? 'status-blocked' : 'status-pending';
			tr.innerHTML = `
				<td>${u.name}</td>
				<td>${u.email}</td>
				<td>${u.role.charAt(0).toUpperCase()+u.role.slice(1)}</td>
				<td><span class="status-badge ${statusClass}">${u.status}</span></td>
				<td>${u.created_at || ''}</td>
				<td>
					<button class="btn-action btn-view" data-action="view" data-id="${u.id}">View</button>
					${u.role==='tutor' && u.status==='pending' ? `<button class="btn-action btn-view" data-action="approve" data-id="${u.id}">Approve</button>` : ''}
					<button class="btn-action ${u.status==='blocked' ? 'btn-view' : 'btn-block'}" data-action="toggle-block" data-id="${u.id}">${u.status==='blocked' ? 'Unblock' : 'Block'}</button>
				</td>
			`;
			tbody.appendChild(tr);
		});
	}

	document.addEventListener('click', async function(e){
		const btn = e.target.closest('[data-action]');
		if (!btn) return;
		const id = Number(btn.getAttribute('data-id')) || btn.getAttribute('data-id');
		switch(btn.getAttribute('data-action')){
			case 'view': return onViewUser(id);
			case 'approve': return onApproveTutor(id);
			case 'toggle-block': return onToggleBlock(id);
		}
	});

	async function onApproveTutor(userId){
		await window.AdminData.approveTutor(userId);
		await loadUsers();
		alert('Tutor approved');
	}

	async function onToggleBlock(userId){
		await window.AdminData.toggleBlockUser(userId);
		await loadUsers();
	}

	async function onViewUser(userId){
		const u = await window.AdminData.getUserById(userId);
		const modalContent = document.getElementById('userDetailsContent');
		if (!modalContent || !u) return;
		modalContent.innerHTML = `
			<div>
				<p><strong>Name:</strong> ${u.name}</p>
				<p><strong>Email:</strong> ${u.email}</p>
				<p><strong>Role:</strong> ${u.role}</p>
				<p><strong>Status:</strong> ${u.status}</p>
				<p><strong>Joined:</strong> ${u.created_at || ''}</p>
				<hr/>
				<p><strong>Recent activity (mock):</strong></p>
				<ul>
					<li>Requests posted: ${(await window.AdminData.fetchRequests({ student_id: u.id }))?.length}</li>
					<li>Applications submitted: ${(await window.AdminData.fetchApplications({ tutor_id: u.id }))?.length}</li>
				</ul>
			</div>
		`;
		const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
		modal.show();
	}

	// Requests Tab
	async function loadRequests(){
		const reqs = await window.AdminData.fetchRequests({});
		renderRequestsTable(reqs);
		renderRequestPaymentsSummary();
	}

	function renderRequestsTable(requests){
		const tbody = document.querySelector('#requestsTable tbody');
		if (!tbody) return;
		tbody.innerHTML = '';
		requests.forEach(r => {
			const statusClass = r.status === 'open' ? 'status-active' : r.status === 'closed' ? 'status-resolved' : 'status-pending';
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${r.subject}</td>
				<td>${r.location}</td>
				<td>${r.student_id}</td>
				<td><span class="status-badge ${statusClass}">${r.status}</span></td>
				<td>${r.created_at||''}</td>
				<td>
					<button class="btn-action btn-view" data-req="${r.id}" data-ract="edit">Edit</button>
					${r.status==='open' ? `<button class="btn-action btn-resolve" data-req="${r.id}" data-ract="close">Close</button>` : ''}
					<button class="btn-action btn-block" data-req="${r.id}" data-ract="delete">Delete</button>
					<button class="btn-action btn-view" data-req="${r.id}" data-ract="assign">Assign</button>
				</td>
			`;
			tbody.appendChild(tr);
		});
	}

	document.addEventListener('click', async function(e){
		const btn = e.target.closest('[data-ract]');
		if (!btn) return;
		const id = Number(btn.getAttribute('data-req'));
		switch(btn.getAttribute('data-ract')){
			case 'close': await window.AdminData.closeRequest(id); await loadRequests(); alert('Request closed'); break;
			case 'delete': if(confirm('Delete this request?')) { await window.AdminData.deleteRequest(id); await loadRequests(); } break;
			case 'assign': onOpenAssignModal(id); break;
			case 'edit': onOpenEditModal(id); break;
		}
	});

	async function onOpenAssignModal(requestId){
		const activeTutors = (await window.AdminData.fetchUsers({ role: 'tutor', status: 'active' })) || [];
		const list = activeTutors.map(t=>`<option value="${t.id}">${t.name} (${t.email||''})</option>`).join('');
		const html = `
			<div class="modal fade" id="assignModal" tabindex="-1">
				<div class="modal-dialog">
					<div class="modal-content" style="background: rgba(35,41,70,0.95); color:#eaeaea; border:1px solid rgba(92,225,230,0.2);">
						<div class="modal-header"><h5 class="modal-title" style="color:#5ce1e6;">Assign Tutor</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
						<div class="modal-body">
							<label for="assignTutorSelect">Select Tutor</label>
							<select id="assignTutorSelect" class="form-select">${list}</select>
						</div>
						<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="assignConfirmBtn">Assign</button></div>
					</div>
				</div>
			</div>`;
		document.body.insertAdjacentHTML('beforeend', html);
		const modalEl = document.getElementById('assignModal');
		const modal = new bootstrap.Modal(modalEl);
		modal.show();
		modalEl.querySelector('#assignConfirmBtn').onclick = async () => {
			const tid = Number(modalEl.querySelector('#assignTutorSelect').value);
			await window.AdminData.assignTutorToRequest(requestId, tid);
			modal.hide(); modalEl.remove();
			alert('Tutor assigned');
		};
		modalEl.addEventListener('hidden.bs.modal', ()=> modalEl.remove());
	}

	async function onOpenEditModal(requestId){
		const reqs = await window.AdminData.fetchRequests({});
		const r = (reqs||[]).find(x=>x.id===requestId);
		if (!r) { alert('Request not found'); return; }
		const html = `
			<div class="modal fade" id="editReqModal" tabindex="-1">
				<div class="modal-dialog">
					<div class="modal-content" style="background: rgba(35,41,70,0.95); color:#eaeaea; border:1px solid rgba(92,225,230,0.2);">
						<div class="modal-header"><h5 class="modal-title" style="color:#5ce1e6;">Edit Request #${r.id}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
						<div class="modal-body">
							<input id="er-subject" class="form-control mb-2" placeholder="Subject" value="${r.subject}">
							<input id="er-class" class="form-control mb-2" placeholder="Class" value="${r.class}">
							<input id="er-location" class="form-control mb-2" placeholder="Location" value="${r.location}">
							<input id="er-salary" class="form-control mb-2" placeholder="Salary Range" value="${r.salary_range}">
							<input id="er-type" class="form-control mb-2" placeholder="Tuition Type" value="${r.tuition_type}">
							<select id="er-status" class="form-select"><option ${r.status==='open'?'selected':''} value="open">open</option><option ${r.status==='closed'?'selected':''} value="closed">closed</option></select>
						</div>
						<div class="modal-footer"><button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-primary" id="er-save">Save</button></div>
					</div>
				</div>
			</div>`;
		document.body.insertAdjacentHTML('beforeend', html);
		const modalEl = document.getElementById('editReqModal');
		const modal = new bootstrap.Modal(modalEl);
		modal.show();
		modalEl.querySelector('#er-save').onclick = async () => {
			const changes = {
				subject: modalEl.querySelector('#er-subject').value,
				class: modalEl.querySelector('#er-class').value,
				location: modalEl.querySelector('#er-location').value,
				salary_range: modalEl.querySelector('#er-salary').value,
				tuition_type: modalEl.querySelector('#er-type').value,
				status: modalEl.querySelector('#er-status').value
			};
			await window.AdminData.editRequest(requestId, changes);
			modal.hide(); modalEl.remove();
			await loadRequests();
		};
		modalEl.addEventListener('hidden.bs.modal', ()=> modalEl.remove());
	}

	async function renderRequestPaymentsSummary(){
		const wrap = document.getElementById('requestPaymentsSummary');
		if (!wrap) return;
		const payments = await window.AdminData.fetchPayments();
		const grouped = {};
		payments.forEach(p=>{
			const key = p.request_id || 'n/a';
			grouped[key] = grouped[key] || { amount: 0, payments: 0, pending: 0, collected: 0 };
			grouped[key].amount += p.amount_total || 0;
			grouped[key].payments += 1;
			if (p.commission_status === 'collected') grouped[key].collected += p.commission_amount || 0;
			else grouped[key].pending += p.commission_amount || 0;
		});
		wrap.innerHTML = '';
		Object.keys(grouped).forEach(reqId => {
			const g = grouped[reqId];
			const card = document.createElement('div');
			card.className = 'stat-card';
			card.style.minWidth = '260px';
			card.innerHTML = `
				<h4 style="color:#eaeaea; margin:0 0 0.25rem 0;">Request #${reqId}</h4>
				<p style="margin:0;">Payments: <strong style="color:#eaeaea;">${g.payments}</strong></p>
				<p style="margin:0;">Total Paid: <strong style="color:#eaeaea;">${g.amount} BDT</strong></p>
				<p style="margin:0;">Commission Pending: <strong style="color:#eaeaea;">${g.pending} BDT</strong></p>
				<p style="margin:0;">Commission Collected: <strong style="color:#eaeaea;">${g.collected} BDT</strong></p>
			`;
			wrap.appendChild(card);
		});
	}

	// Reports Tab
	async function loadReports(){
		const reports = await window.AdminData.fetchReports({});
		renderReportsTable(reports);
	}

	function renderReportsTable(reports){
		const tbody = document.querySelector('#reportsTable tbody');
		if (!tbody) return;
		tbody.innerHTML = '';
		reports.forEach(r => {
			const statusClass = r.status === 'resolved' ? 'status-resolved' : 'status-pending';
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${r.reporter_id}</td>
				<td>${r.reason}</td>
				<td>${r.content_id}</td>
				<td>${r.created_at||''}</td>
				<td><span class="status-badge ${statusClass}">${r.status}</span></td>
				<td>
					<button class="btn-action btn-view" data-rep="${r.id}" data-pact="view">View</button>
					${r.status==='pending' ? `<button class="btn-action btn-resolve" data-rep="${r.id}" data-pact="resolve">Resolve</button>` : ''}
					<button class="btn-action btn-block" data-uid="${r.reported_user_id}" data-pact="block-user">Block User</button>
				</td>
			`;
			tbody.appendChild(tr);
		});
	}

	document.addEventListener('click', async function(e){
		const viewBtn = e.target.closest('[data-pact]');
		if (!viewBtn) return;
		const pact = viewBtn.getAttribute('data-pact');
		if (pact === 'view'){
			const id = viewBtn.getAttribute('data-rep');
			const reports = await window.AdminData.fetchReports({});
			const r = (reports||[]).find(x=>String(x.id)===String(id));
			if (!r) return;
			alert(`Report ${id}\nReason: ${r.reason}\nDetails: ${r.details}\nContent: ${r.content_id}\nReported User: ${r.reported_user_id}`);
			return;
		}
		if (pact === 'resolve'){
			const id = viewBtn.getAttribute('data-rep');
			await window.AdminData.resolveReport(id);
			await loadReports();
			alert('Report resolved');
			return;
		}
		if (pact === 'block-user'){
			const uid = Number(viewBtn.getAttribute('data-uid'));
			await window.AdminData.blockUser(uid);
			await loadUsers();
			await loadReports();
			return;
		}
	});

	// Analytics/Payments
	async function loadAnalyticsAndPayments(){
		renderPaymentsTable(await window.AdminData.fetchPayments());
		renderAnalytics(await window.AdminData.getAnalyticsSummary());
	}

	function renderPaymentsTable(payments){
		const tbody = document.querySelector('#paymentsTable tbody');
		if (!tbody) return;
		tbody.innerHTML = '';
		payments.forEach(p => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${p.id}</td>
				<td>${p.match_id}</td>
				<td>${p.student_id}</td>
				<td>${p.tutor_id}</td>
				<td>${p.amount_total}</td>
				<td><span class="status-badge ${p.payment_status === 'received' ? 'status-active' : 'status-pending'}">${p.payment_status}</span></td>
				<td>${p.commission_amount} (${p.commission_rate*100}%)</td>
				<td>${p.commission_status}</td>
				<td>${p.commission_status==='pending' ? `<button class="btn-action btn-resolve" data-pay="${p.id}" data-cact="collect">Mark Collected</button>` : ''}</td>
			`;
			tbody.appendChild(tr);
		});
	}

	document.addEventListener('click', async function(e){
		const btn = e.target.closest('[data-cact]');
		if (!btn) return;
		if (btn.getAttribute('data-cact')==='collect'){
			await window.AdminData.markCommissionCollected(btn.getAttribute('data-pay'));
			await loadAnalyticsAndPayments();
			alert('Commission marked as collected.');
		}
	});

	function renderAnalytics(summary){
		const cards = document.getElementById('analyticsCards');
		if (cards && summary){
			cards.innerHTML = `
				<div class="col-md-4 mb-4"><div class="stat-card"><h4 style="color:#eaeaea;">${summary.counts.totalUsers}</h4><p>Total Users</p></div></div>
				<div class="col-md-4 mb-4"><div class="stat-card"><h4 style="color:#eaeaea;">${summary.counts.totalTutors}</h4><p>Total Tutors</p></div></div>
				<div class="col-md-4 mb-4"><div class="stat-card"><h4 style="color:#eaeaea;">${summary.counts.totalStudents}</h4><p>Total Students</p></div></div>
				<div class="col-md-4 mb-4"><div class="stat-card"><h4 style="color:#eaeaea;">${summary.counts.openRequests}</h4><p>Open Requests</p></div></div>
				<div class="col-md-4 mb-4"><div class="stat-card"><h4 style="color:#eaeaea;">${summary.counts.pendingReports}</h4><p>Pending Reports</p></div></div>
				<div class="col-md-4 mb-4"><div class="stat-card"><h4 style="color:#eaeaea;">${summary.counts.totalPayments}</h4><p>Total Payments</p></div></div>
				<div class="col-md-6 mb-4"><div class="stat-card"><h4 style="color:#eaeaea;">${summary.counts.commissionPending} BDT</h4><p>Commission Pending</p></div></div>
				<div class="col-md-6 mb-4"><div class="stat-card"><h4 style="color:#eaeaea;">${summary.counts.commissionCollected} BDT</h4><p>Commission Collected</p></div></div>
			`;
		}
		const trend = document.getElementById('commissionTrend');
		if (trend && summary){
			trend.innerHTML='';
			const months = Object.keys(summary.charts.commissionByMonth).sort();
			if (months.length===0){ trend.textContent = 'No data'; return; }
			const max = Math.max(...months.map(m=>summary.charts.commissionByMonth[m]));
			const wrap = document.createElement('div');
			wrap.style.display='flex'; wrap.style.gap='8px'; wrap.style.alignItems='flex-end'; wrap.style.height='120px';
			months.forEach(m=>{
				const bar = document.createElement('div');
				bar.title = `${m}: ${summary.charts.commissionByMonth[m]} BDT`;
				bar.style.width='28px';
				bar.style.height = (max ? (summary.charts.commissionByMonth[m]/max)*100 : 0) + '%';
				bar.style.background='linear-gradient(135deg, #5ce1e6, #4fc3f7)';
				bar.style.borderRadius='6px 6px 0 0';
				wrap.appendChild(bar);
			});
			trend.appendChild(wrap);
		}
	}

	document.addEventListener('DOMContentLoaded', async function(){
		const ok = await window.auth?.initAuth?.('admin');
		if (!ok) return;
		await loadUsers();
		await loadRequests();
		await loadReports();
		await loadAnalyticsAndPayments();
		await initNotificationBell();
	});

	async function initNotificationBell(){
		const bell = document.getElementById('notification-bell');
		const badge = document.getElementById('badge-bell');
		if (!bell || !badge) return;
		const summary = await window.AdminData.getAnalyticsSummary();
		const pendingTutors = summary?.counts?.pendingTutors || 0;
		const openRequests = summary?.counts?.openRequests || 0;
		const pendingReports = summary?.counts?.pendingReports || 0;
		const total = pendingTutors + openRequests + pendingReports;
		badge.textContent = total;
		badge.style.display = total > 0 ? 'flex' : 'none';
		bell.addEventListener('click', function(){
			alert(`Notifications:\nPending Tutors: ${pendingTutors}\nOpen Requests: ${openRequests}\nPending Reports: ${pendingReports}`);
		});
	}
})();
