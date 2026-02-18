/**
 * SaniCrete CRM System - Interactive Business Management
 * Full-featured CRM with automations, follow-ups, and workflow management
 */

class SaniCreteCRM {
    constructor() {
        this.prospects = {};
        this.originalData = {};
        this.currentProspect = null;
        this.currentView = 'prospects';
        this.filters = {
            search: '',
            status: '',
            category: '',
            sort: 'priority'
        };
        
        this.initialize();
    }
    
    async initialize() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderProspects();
            this.updateSidebarStats();
            this.loadUserData();
            this.checkOverdueFollowups();
        } catch (error) {
            console.error('Failed to initialize CRM:', error);
            this.showNotification('Failed to load CRM data', 'error');
        }
    }
    
    async loadData() {
        try {
            const response = await fetch('filtered_crm_data.json');
            const data = await response.json();
            this.originalData = data.filtered_prospects;
            
            // Enhance data with CRM features
            this.prospects = {};
            Object.entries(this.originalData).forEach(([name, prospect]) => {
                this.prospects[name] = {
                    ...prospect,
                    // CRM-specific fields
                    status: this.getUserData(name, 'status') || 'new',
                    priority_tags: this.getUserData(name, 'priority_tags') || [],
                    notes: this.getUserData(name, 'notes') || '',
                    next_action: this.getUserData(name, 'next_action') || '',
                    followups: this.getUserData(name, 'followups') || [],
                    last_contacted: this.getUserData(name, 'last_contacted') || null,
                    next_followup: this.getUserData(name, 'next_followup') || null,
                    custom_score: this.calculateCustomScore(prospect)
                };
            });
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }
    
    calculateCustomScore(prospect) {
        let score = prospect.overall_score || 0;
        
        // Boost score for recent activity
        const now = new Date();
        const lastContact = new Date(prospect.latest_contact);
        const daysSinceContact = (now - lastContact) / (1000 * 60 * 60 * 24);
        
        if (daysSinceContact < 30) score += 50;
        else if (daysSinceContact < 90) score += 25;
        
        // Boost for business keywords
        if (prospect.business_score > 10) score += 25;
        if (prospect.conversation_score > 5) score += 15;
        
        return Math.round(score);
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(e.target.closest('.nav-link').dataset.view);
            });
        });
        
        // Filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.renderProspects();
        });
        
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.renderProspects();
        });
        
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.renderProspects();
        });
        
        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.renderProspects();
        });
        
        // Modal events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }
    
    switchView(view) {
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.view === view);
        });
        
        this.currentView = view;
        
        // Update title and render appropriate data
        const titles = {
            prospects: 'All Business Prospects',
            hot: '🔥 Hot Leads',
            followups: '📅 Follow-ups Due',
            food: '🍽️ Food Processing Companies',
            construction: '🏗️ Construction Companies', 
            industrial: '🏭 Industrial Companies',
            analytics: '📊 Business Analytics'
        };
        
        document.getElementById('viewTitle').textContent = titles[view] || 'SaniCrete CRM';
        this.renderProspects();
    }
    
    getFilteredProspects() {
        let filtered = Object.entries(this.prospects);
        
        // View filters
        switch (this.currentView) {
            case 'hot':
                filtered = filtered.filter(([_, p]) => p.status === 'hot');
                break;
            case 'followups':
                filtered = filtered.filter(([_, p]) => this.hasOverdueFollowup(p));
                break;
            case 'food':
                filtered = filtered.filter(([_, p]) => p.category === 'Food Processing');
                break;
            case 'construction':
                filtered = filtered.filter(([_, p]) => p.category === 'Construction');
                break;
            case 'industrial':
                filtered = filtered.filter(([_, p]) => p.category === 'Industrial/Manufacturing');
                break;
        }
        
        // Search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(([name, prospect]) => {
                return name.toLowerCase().includes(search) ||
                       prospect.notes.toLowerCase().includes(search) ||
                       prospect.category.toLowerCase().includes(search);
            });
        }
        
        // Status filter
        if (this.filters.status) {
            filtered = filtered.filter(([_, p]) => p.status === this.filters.status);
        }
        
        // Category filter  
        if (this.filters.category) {
            filtered = filtered.filter(([_, p]) => p.category === this.filters.category);
        }
        
        // Sort
        filtered.sort(([nameA, prospectA], [nameB, prospectB]) => {
            switch (this.filters.sort) {
                case 'priority':
                    return this.getPriorityScore(prospectB) - this.getPriorityScore(prospectA);
                case 'score':
                    return prospectB.custom_score - prospectA.custom_score;
                case 'recent':
                    return new Date(prospectB.latest_contact || 0) - new Date(prospectA.latest_contact || 0);
                case 'followup':
                    return this.getFollowupPriority(prospectB) - this.getFollowupPriority(prospectA);
                case 'name':
                    return nameA.localeCompare(nameB);
                default:
                    return prospectB.custom_score - prospectA.custom_score;
            }
        });
        
        return filtered;
    }
    
    getPriorityScore(prospect) {
        let score = 0;
        
        // Status priority
        const statusScores = { hot: 100, warm: 50, new: 25, cold: 10 };
        score += statusScores[prospect.status] || 0;
        
        // Priority tags
        score += prospect.priority_tags.length * 20;
        
        // Overdue follow-up penalty
        if (this.hasOverdueFollowup(prospect)) score += 200;
        
        // Recent activity
        if (prospect.custom_score) score += prospect.custom_score / 10;
        
        return score;
    }
    
    getFollowupPriority(prospect) {
        if (!prospect.next_followup) return 0;
        
        const now = new Date();
        const followupDate = new Date(prospect.next_followup);
        const daysOverdue = (now - followupDate) / (1000 * 60 * 60 * 24);
        
        return Math.max(0, daysOverdue * 10);
    }
    
    hasOverdueFollowup(prospect) {
        if (!prospect.next_followup) return false;
        return new Date() > new Date(prospect.next_followup);
    }
    
    renderProspects() {
        const container = document.getElementById('prospectsGrid');
        const filtered = this.getFilteredProspects();
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="loading">No prospects match the current filters.</div>';
            return;
        }
        
        container.innerHTML = filtered.map(([name, prospect]) => 
            this.createProspectCard(name, prospect)
        ).join('');
    }
    
    createProspectCard(name, prospect) {
        const overdue = this.hasOverdueFollowup(prospect);
        const priorityTags = prospect.priority_tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
        
        return `
            <div class="prospect-card ${prospect.status}" data-company="${name}">
                <div class="prospect-header">
                    <div class="prospect-info">
                        <h3>${name}</h3>
                        <div class="prospect-meta">
                            <span class="prospect-status status-${prospect.status}">${this.getStatusIcon(prospect.status)} ${prospect.status}</span>
                            <span>${prospect.category}</span>
                            <span>Score: ${prospect.custom_score}</span>
                            ${overdue ? '<span style="color: #e53e3e;">⚠️ Overdue</span>' : ''}
                        </div>
                    </div>
                    <div class="prospect-actions">
                        <button class="btn-icon btn-edit" onclick="crm.editProspect('${name}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-followup" onclick="crm.scheduleFollowup('${name}')" title="Follow-up">
                            <i class="fas fa-calendar-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="prospect-details">
                    <div class="detail-stat">
                        <div class="detail-value">${prospect.total_emails}</div>
                        <div class="detail-label">Emails</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-value">${prospect.business_score}</div>
                        <div class="detail-label">Business</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-value">${prospect.conversation_score}</div>
                        <div class="detail-label">Conversations</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-value">${prospect.latest_contact ? new Date(prospect.latest_contact).toLocaleDateString() : 'N/A'}</div>
                        <div class="detail-label">Last Contact</div>
                    </div>
                </div>
                
                ${priorityTags ? `<div class="priority-tags">${priorityTags}</div>` : ''}
                
                ${prospect.notes ? `
                    <div class="prospect-notes">
                        <div class="notes-header">
                            <span class="notes-title">📝 Notes</span>
                        </div>
                        <div class="notes-display">${prospect.notes}</div>
                    </div>
                ` : ''}
                
                ${prospect.next_action ? `
                    <div class="next-action">
                        <strong>Next Action:</strong> ${prospect.next_action}
                    </div>
                ` : ''}
                
                ${prospect.next_followup ? `
                    <div class="reminder-indicator ${overdue ? 'overdue' : ''}">
                        <i class="fas fa-clock"></i>
                        Follow-up: ${new Date(prospect.next_followup).toLocaleDateString()}
                        ${overdue ? '(Overdue)' : ''}
                    </div>
                ` : ''}
                
                <div class="quick-actions">
                    <button class="action-btn" onclick="crm.quickAction('${name}', 'call')">
                        📞 Call
                    </button>
                    <button class="action-btn" onclick="crm.quickAction('${name}', 'email')">
                        📧 Email
                    </button>
                    <button class="action-btn" onclick="crm.quickAction('${name}', 'quote')">
                        📋 Quote
                    </button>
                    <button class="action-btn" onclick="crm.quickAction('${name}', 'visit')">
                        🏢 Visit
                    </button>
                    <button class="action-btn" onclick="crm.setStatus('${name}', 'hot')">
                        🔥 Mark Hot
                    </button>
                </div>
            </div>
        `;
    }
    
    getStatusIcon(status) {
        const icons = {
            hot: '🔥',
            warm: '🌡️', 
            cold: '❄️',
            new: '✨'
        };
        return icons[status] || '❓';
    }
    
    // CRM ACTIONS
    
    editProspect(companyName) {
        this.currentProspect = companyName;
        const prospect = this.prospects[companyName];
        
        document.getElementById('editCompanyName').value = companyName;
        document.getElementById('editStatus').value = prospect.status;
        document.getElementById('editNotes').value = prospect.notes || '';
        document.getElementById('editNextAction').value = prospect.next_action || '';
        
        // Set priority tags
        document.querySelectorAll('#priorityTags input').forEach(checkbox => {
            checkbox.checked = prospect.priority_tags.includes(checkbox.value);
        });
        
        document.getElementById('editModal').style.display = 'block';
    }
    
    saveProspect() {
        if (!this.currentProspect) return;
        
        const prospect = this.prospects[this.currentProspect];
        
        prospect.status = document.getElementById('editStatus').value;
        prospect.notes = document.getElementById('editNotes').value;
        prospect.next_action = document.getElementById('editNextAction').value;
        
        // Update priority tags
        prospect.priority_tags = Array.from(
            document.querySelectorAll('#priorityTags input:checked')
        ).map(cb => cb.value);
        
        // Save to localStorage
        this.saveUserData(this.currentProspect, {
            status: prospect.status,
            notes: prospect.notes,
            next_action: prospect.next_action,
            priority_tags: prospect.priority_tags
        });
        
        this.closeModal('editModal');
        this.renderProspects();
        this.updateSidebarStats();
        this.showNotification('Prospect updated successfully!', 'success');
    }
    
    scheduleFollowup(companyName) {
        this.currentProspect = companyName;
        
        // Set default follow-up date (1 week from now)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        document.getElementById('followupDateTime').value = 
            defaultDate.toISOString().slice(0, 16);
        
        document.getElementById('followupModal').style.display = 'block';
    }
    
    async scheduleFollowup() {
        if (!this.currentProspect) return;
        
        const type = document.getElementById('followupType').value;
        const datetime = document.getElementById('followupDateTime').value;
        const notes = document.getElementById('followupNotes').value;
        const emailTemplate = document.getElementById('emailTemplate').value;
        
        if (!datetime) {
            this.showNotification('Please select a date and time', 'warning');
            return;
        }
        
        const followupDate = new Date(datetime);
        const prospect = this.prospects[this.currentProspect];
        
        // Create follow-up object
        const followup = {
            id: Date.now(),
            type,
            datetime,
            notes,
            emailTemplate,
            created: new Date().toISOString(),
            completed: false
        };
        
        // Add to prospect
        if (!prospect.followups) prospect.followups = [];
        prospect.followups.push(followup);
        prospect.next_followup = datetime;
        
        // Save to localStorage
        this.saveUserData(this.currentProspect, {
            followups: prospect.followups,
            next_followup: prospect.next_followup
        });
        
        // Create OpenClaw cron reminder
        await this.createCronReminder(this.currentProspect, followup);
        
        // Generate email template if requested
        if (type === 'email' && emailTemplate) {
            this.generateEmailTemplate(this.currentProspect, emailTemplate);
        }
        
        this.closeModal('followupModal');
        this.renderProspects();
        this.updateSidebarStats();
        this.showNotification(`Follow-up scheduled for ${followupDate.toLocaleDateString()}!`, 'success');
    }
    
    async createCronReminder(companyName, followup) {
        try {
            // Convert to cron format for OpenClaw
            const followupDate = new Date(followup.datetime);
            const cronCommand = `openclaw message send --target="Tyler" --message="🔔 CRM REMINDER: Follow-up due for ${companyName}\\n\\nType: ${followup.type}\\nNotes: ${followup.notes || 'No notes'}\\n\\nScheduled: ${followupDate.toLocaleString()}"`;
            
            // Create cron job using OpenClaw cron system
            const cronResponse = await fetch('/api/cron/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: `CRM_followup_${companyName}_${followup.id}`,
                    schedule: this.dateToCron(followupDate),
                    command: cronCommand,
                    description: `CRM follow-up reminder for ${companyName}`
                })
            }).catch(() => {
                // Fallback: Log the cron command for manual setup
                console.log('Cron command to create manually:', cronCommand);
                console.log('Schedule:', this.dateToCron(followupDate));
            });
            
        } catch (error) {
            console.error('Failed to create cron reminder:', error);
            // Still save the follow-up locally even if cron fails
        }
    }
    
    dateToCron(date) {
        // Convert JavaScript Date to cron format
        const minute = date.getMinutes();
        const hour = date.getHours();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        return `${minute} ${hour} ${day} ${month} *`;
    }
    
    generateEmailTemplate(companyName, templateType) {
        const prospect = this.prospects[companyName];
        const templates = {
            quote_followup: `
Subject: Follow-up: SaniCrete Flooring Quote for ${companyName}

Dear ${companyName} Team,

I wanted to follow up on the flooring quote we discussed. SaniCrete specializes in high-performance epoxy and concrete flooring solutions perfect for your facility.

Key benefits for your project:
• Seamless, easy-to-clean surfaces
• Chemical and impact resistant
• FDA compliant for food processing facilities
• Custom color and texture options
• Professional installation team

I'd be happy to schedule a site visit to discuss your specific needs and provide a detailed quote.

Best regards,
Tyler
SaniCrete Flooring Solutions
            `,
            
            introduction: `
Subject: SaniCrete Flooring Solutions - Industrial Flooring Specialists

Hello ${companyName},

I noticed your facility might benefit from our specialized flooring solutions. SaniCrete has been helping ${prospect.category.toLowerCase()} companies with:

• Epoxy floor coatings
• Concrete surface preparation
• Chemical-resistant flooring
• FDA compliant solutions
• Facility maintenance programs

Would you be interested in a brief call to discuss how we can help improve your facility's flooring performance?

Best regards,
Tyler
SaniCrete Flooring Solutions
            `,
            
            project_inquiry: `
Subject: Flooring Project Inquiry - ${companyName}

Dear ${companyName} Team,

I understand you may have upcoming flooring projects. SaniCrete specializes in:

• Food processing facility floors
• Industrial concrete coatings  
• Warehouse and manufacturing floors
• Chemical resistant surfaces
• Repair and maintenance services

Our team can provide:
• Free site evaluations
• Detailed project quotes
• Professional installation
• Ongoing maintenance support

Would you like to schedule a site visit to discuss your needs?

Best regards,
Tyler
SaniCrete Flooring Solutions
            `,
            
            capabilities: `
Subject: SaniCrete Capabilities Overview for ${companyName}

Dear ${companyName},

Here's an overview of SaniCrete's flooring capabilities:

SERVICES:
• Epoxy floor coatings
• Concrete polishing & overlays
• Chemical resistant flooring
• FDA compliant food-grade floors
• Industrial floor repair

INDUSTRIES WE SERVE:
• Food processing facilities
• Manufacturing plants
• Warehouses & distribution centers
• Commercial kitchens
• Industrial facilities

COMPETITIVE ADVANTAGES:
• 15+ years experience
• Licensed & insured
• Quality materials & installation
• Competitive pricing
• Ongoing support

I'd welcome the opportunity to discuss your specific flooring needs.

Best regards,
Tyler
SaniCrete Flooring Solutions
            `
        };
        
        const emailContent = templates[templateType];
        if (emailContent) {
            // Copy to clipboard
            navigator.clipboard.writeText(emailContent).then(() => {
                this.showNotification('Email template copied to clipboard!', 'success');
            });
            
            // Also log to console for easy access
            console.log('Email template for', companyName, ':', emailContent);
        }
    }
    
    quickAction(companyName, action) {
        const prospect = this.prospects[companyName];
        
        switch (action) {
            case 'call':
                // Update last contacted
                prospect.last_contacted = new Date().toISOString();
                this.saveUserData(companyName, { last_contacted: prospect.last_contacted });
                this.showNotification(`Marked as called: ${companyName}`, 'success');
                break;
                
            case 'email':
                // Generate quick email template
                this.generateEmailTemplate(companyName, 'introduction');
                prospect.last_contacted = new Date().toISOString();
                this.saveUserData(companyName, { last_contacted: prospect.last_contacted });
                break;
                
            case 'quote':
                // Mark as quote requested, set follow-up
                prospect.notes += `\\n[${new Date().toLocaleDateString()}] Quote requested`;
                const quoteFollowup = new Date();
                quoteFollowup.setDate(quoteFollowup.getDate() + 3);
                prospect.next_followup = quoteFollowup.toISOString();
                this.saveUserData(companyName, { 
                    notes: prospect.notes,
                    next_followup: prospect.next_followup
                });
                this.showNotification(`Quote follow-up scheduled for ${companyName}`, 'success');
                break;
                
            case 'visit':
                // Schedule site visit
                this.scheduleFollowup(companyName);
                break;
        }
        
        this.renderProspects();
    }
    
    setStatus(companyName, status) {
        const prospect = this.prospects[companyName];
        prospect.status = status;
        this.saveUserData(companyName, { status });
        this.renderProspects();
        this.updateSidebarStats();
        this.showNotification(`${companyName} marked as ${status}`, 'success');
    }
    
    // BULK OPERATIONS
    
    bulkActions() {
        // TODO: Implement bulk operations modal
        this.showNotification('Bulk actions coming soon!', 'warning');
    }
    
    exportData() {
        const exportData = Object.entries(this.prospects).map(([name, prospect]) => ({
            company: name,
            status: prospect.status,
            category: prospect.category,
            total_emails: prospect.total_emails,
            business_score: prospect.business_score,
            custom_score: prospect.custom_score,
            latest_contact: prospect.latest_contact,
            notes: prospect.notes,
            next_action: prospect.next_action,
            priority_tags: prospect.priority_tags.join(', '),
            next_followup: prospect.next_followup
        }));
        
        const csv = this.arrayToCSV(exportData);
        this.downloadCSV(csv, 'sanicrete-crm-prospects.csv');
        this.showNotification('Data exported successfully!', 'success');
    }
    
    arrayToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ];
        
        return csv.join('\\n');
    }
    
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    // UTILITY FUNCTIONS
    
    saveUserData(companyName, data) {
        const key = `crm_${companyName}`;
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        const updated = { ...existing, ...data, lastUpdated: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify(updated));
    }
    
    getUserData(companyName, field) {
        const key = `crm_${companyName}`;
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return data[field];
    }
    
    loadUserData() {
        // Load any previously saved user data
        Object.keys(this.prospects).forEach(companyName => {
            const userData = JSON.parse(localStorage.getItem(`crm_${companyName}`) || '{}');
            Object.assign(this.prospects[companyName], userData);
        });
    }
    
    checkOverdueFollowups() {
        const overdue = Object.entries(this.prospects)
            .filter(([_, prospect]) => this.hasOverdueFollowup(prospect))
            .length;
            
        if (overdue > 0) {
            setTimeout(() => {
                this.showNotification(`${overdue} follow-ups are overdue!`, 'warning');
            }, 2000);
        }
    }
    
    updateSidebarStats() {
        const stats = {
            total: Object.keys(this.prospects).length,
            hot: Object.values(this.prospects).filter(p => p.status === 'hot').length,
            due: Object.values(this.prospects).filter(p => this.hasOverdueFollowup(p)).length,
            active: Object.values(this.prospects).filter(p => {
                if (!p.latest_contact) return false;
                const lastContact = new Date(p.latest_contact);
                const now = new Date();
                const daysSince = (now - lastContact) / (1000 * 60 * 60 * 24);
                return daysSince <= 30;
            }).length
        };
        
        document.getElementById('sidebarTotal').textContent = stats.total;
        document.getElementById('sidebarHot').textContent = stats.hot;
        document.getElementById('sidebarDue').textContent = stats.due;
        document.getElementById('sidebarActive').textContent = stats.active;
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        this.currentProspect = null;
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    refreshData() {
        this.initialize();
        this.showNotification('Data refreshed!', 'success');
    }
}

// Global functions for HTML onclick handlers
window.crm = new SaniCreteCRM();

window.addProspect = () => {
    crm.showNotification('Add Prospect feature coming soon!', 'warning');
};

window.bulkActions = () => {
    crm.bulkActions();
};

window.exportData = () => {
    crm.exportData();
};

window.refreshData = () => {
    crm.refreshData();
};

window.closeModal = (modalId) => {
    crm.closeModal(modalId);
};

window.scheduleFollowup = () => {
    crm.scheduleFollowup();
};

window.saveProspect = () => {
    crm.saveProspect();
};