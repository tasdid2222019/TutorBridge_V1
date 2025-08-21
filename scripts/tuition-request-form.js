// scripts/tuition-request-form.js
// Handles tuition request form submission with Supabase integration

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("tuition-request-form");
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form || !submitBtn) {
        console.error("Form elements not found");
        return;
    }

    // Add loading state to submit button
    const originalText = submitBtn.innerHTML;
    
    function setLoading(loading) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Submitting...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    // Add loading spinner styles
    if (!document.querySelector('#loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 0.5rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Collect form data with correct field IDs
            const formData = {
                student_name: document.getElementById("student-name").value.trim(),
                curriculum: document.getElementById("curriculum").value,
                class_level: document.getElementById("classLevel").value.trim(),
                subject: document.getElementById("subject").value.trim(),
                location: document.getElementById("location").value.trim(),
                tuition_type: document.querySelector('input[name="tuition_type"]:checked')?.value,
                session_duration: parseFloat(document.getElementById("duration").value),
                days_per_week: parseInt(document.getElementById("days").value),
                salary_range: document.getElementById("salary").value.trim(),
                additional_details: document.getElementById("details").value.trim(),
                status: "open",
                created_at: new Date().toISOString()
            };

            console.log("📌 Request data:", formData);

            // 🔑 Supabase Integration
            const supabase = window.initSupabase?.();
            if (supabase) {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    throw new Error("User not authenticated");
                }

                // Add student_id to form data
                formData.student_id = user.id;

                // Insert tuition request
                const { data, error } = await supabase
                    .from("tuition_requests")
                    .insert([formData])
                    .select()
                    .single();

                if (error) throw error;

                console.log("✅ Request submitted successfully:", data);
                
                // Show success message
                showMessage("✅ Your tuition request has been submitted successfully!", "success");
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = "student-requests.html";
                }, 2000);

            } else {
                // Fallback for development (mock submission)
                console.log("🔧 Supabase not available, using mock submission");
                showMessage("✅ Your request has been submitted! (Mock mode)", "success");
                
                setTimeout(() => {
                    window.location.href = "student-requests.html";
                }, 2000);
            }

        } catch (error) {
            console.error("❌ Error submitting request:", error);
            
            let errorMessage = "Something went wrong. Please try again.";
            if (error.message.includes("User not authenticated")) {
                errorMessage = "Please login to submit a request.";
            } else if (error.message.includes("duplicate key")) {
                errorMessage = "A similar request already exists.";
            }
            
            showMessage(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    });

    function validateForm() {
        const requiredFields = [
            { id: "student-name", name: "Student Name" },
            { id: "curriculum", name: "Curriculum" },
            { id: "classLevel", name: "Class Level" },
            { id: "subject", name: "Subject" },
            { id: "location", name: "Location" },
            { id: "duration", name: "Session Duration" },
            { id: "days", name: "Days per Week" },
            { id: "salary", name: "Salary Range" }
        ];

        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                showMessage(`Please fill in ${field.name}.`, "error");
                element?.focus();
                return false;
            }
        }

        const tuitionType = document.querySelector('input[name="tuition_type"]:checked');
        if (!tuitionType) {
            showMessage("Please select a tuition type.", "error");
            return false;
        }

        const duration = parseFloat(document.getElementById("duration").value);
        if (duration <= 0) {
            showMessage("Session duration must be greater than 0.", "error");
            return false;
        }

        const days = parseInt(document.getElementById("days").value);
        if (days < 1 || days > 7) {
            showMessage("Days per week must be between 1 and 7.", "error");
            return false;
        }

        return true;
    }

    function showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.cssText = `
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            text-align: center;
            font-weight: 500;
        `;

        if (type === "success") {
            messageDiv.style.background = "rgba(92, 225, 230, 0.1)";
            messageDiv.style.border = "1px solid rgba(92, 225, 230, 0.3)";
            messageDiv.style.color = "#5ce1e6";
        } else {
            messageDiv.style.background = "rgba(238, 183, 183, 0.1)";
            messageDiv.style.border = "1px solid rgba(238, 183, 183, 0.3)";
            messageDiv.style.color = "#eeb7b7";
        }

        messageDiv.textContent = message;

        // Insert message before form
        form.parentNode.insertBefore(messageDiv, form);

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
});
