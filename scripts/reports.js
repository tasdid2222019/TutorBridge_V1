// Reusable Report Modal Controller
// Dependencies: window.currentUserId() from scripts/supabaseClient.js

(function () {
	const mockReports = window.mockReports || (window.mockReports = []);

	let overlayEl;
	let modalEl;
	let formEl;
	let closeBtn;
	let cancelBtn;

	function ensureAssetsLoaded() {
		// Inject Font Awesome (for the flag/close icons) if not present
		const hasFA = !!document.querySelector('link[href*="font-awesome"]');
		if (!hasFA) {
			const fa = document.createElement('link');
			fa.rel = 'stylesheet';
			fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
			document.head.appendChild(fa);
		}

		// Inject report.css if not present
		const hasReportCss = !!document.querySelector('link[href$="styles/report.css"]');
		if (!hasReportCss) {
			const css = document.createElement('link');
			css.rel = 'stylesheet';
			css.href = '../styles/report.css';
			document.head.appendChild(css);
		}
	}

	function injectModalIfMissing() {
		if (document.getElementById('report-modal')) return;
		fetch('../pages/report-modal.html')
			.then(res => res.text())
			.then(html => {
				const container = document.createElement('div');
				container.innerHTML = html;
				document.body.appendChild(container);
				cacheElements();
				bindEvents();
			})
			.catch(err => console.error('Failed to load report modal:', err));
	}

	function cacheElements() {
		overlayEl = document.getElementById('report-overlay');
		modalEl = document.getElementById('report-modal');
		formEl = document.getElementById('report-form');
		closeBtn = document.getElementById('report-close-btn');
		cancelBtn = document.getElementById('report-cancel-btn');
	}

	function openModalWithContext(context) {
		if (!overlayEl || !modalEl) return;
		// Populate hidden fields
		const reporterId = (typeof window.currentUserId === 'function') ? window.currentUserId() : null;
		document.getElementById('reporter_id').value = reporterId || '';
		document.getElementById('reported_user_id').value = context.reportedUserId || '';
		document.getElementById('content_id').value = context.contentId || '';

		// Reset form fields
		formEl.reset();
		// Maintain hidden after reset
		document.getElementById('reporter_id').value = reporterId || '';
		document.getElementById('reported_user_id').value = context.reportedUserId || '';
		document.getElementById('content_id').value = context.contentId || '';

		overlayEl.classList.add('active');
		modalEl.classList.add('active');
		modalEl.setAttribute('aria-hidden', 'false');
		overlayEl.setAttribute('aria-hidden', 'false');
	}

	function closeModal() {
		if (!overlayEl || !modalEl) return;
		modalEl.classList.remove('active');
		overlayEl.classList.remove('active');
		modalEl.setAttribute('aria-hidden', 'true');
		overlayEl.setAttribute('aria-hidden', 'true');
	}

	function globalClickListener(e) {
		const trigger = e.target.closest('.report-btn');
		if (trigger) {
			e.preventDefault();
			ensureAssetsLoaded();
			injectModalIfMissing();
			// Wait a tick for DOM to attach if just injected
			setTimeout(() => {
				cacheElements();
				bindEvents();
				const context = {
					reportedUserId: trigger.getAttribute('data-reported-user') || '',
					contentId: trigger.getAttribute('data-content-id') || ''
				};
				openModalWithContext(context);
			}, 0);
		}
	}

	function bindEvents() {
		if (closeBtn) closeBtn.onclick = closeModal;
		if (cancelBtn) cancelBtn.onclick = closeModal;
		if (overlayEl) overlayEl.onclick = closeModal;
		if (formEl) {
			formEl.onsubmit = async function (e) {
				e.preventDefault();
				const formData = new FormData(formEl);
				const reportData = Object.fromEntries(formData.entries());
				reportData.status = 'pending';
				reportData.created_at = new Date().toISOString();

				console.log('Report form data:', reportData);
				try {
					await submitReport(reportData);
					alert('Report submitted successfully.');
					closeModal();
					formEl.reset();
				} catch (err) {
					console.error('Failed to submit report:', err);
					alert('Failed to submit report. Please try again.');
				}
			};
		}
	}

	// Public placeholder for backend integration
	async function submitReport(reportData) {
		// Ensure required fields and defaults
		const payload = {
			reporter_id: reportData.reporter_id || null,
			reported_user_id: reportData.reported_user_id || null,
			content_id: reportData.content_id || null,
			reason: reportData.reason || '',
			details: reportData.details || '',
			status: reportData.status || 'pending',
			created_at: reportData.created_at || new Date().toISOString()
		};

		try {
			const supabase = window.getSupabaseClient?.();
			if (supabase) {
				const { data, error } = await supabase
					.from('reports')
					.insert(payload)
					.select()
					.single();
				if (error) throw error;
				return { ok: true, data };
			}
		} catch (err) {
			console.error('Supabase submitReport failed, using fallback:', err);
		}

		// Fallback to mock
		const id = `rep-${Date.now()}`;
		const local = { id, ...payload };
		mockReports.push(local);
		return { ok: true, data: local };
	}

	// Expose to window for potential manual calls/testing
	window.submitReport = submitReport;

	// Event delegation for Report buttons across the app
	document.addEventListener('click', globalClickListener);
})();


