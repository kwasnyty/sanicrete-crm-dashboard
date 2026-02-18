# 🏗️ SaniCrete Interactive CRM System

A complete, interactive Customer Relationship Management system built specifically for SaniCrete's flooring business. This is NOT just a dashboard - it's a full-featured business tool with drag-and-drop pipeline management, automation engine, and OpenClaw integration.

## 🚀 Live Demo

**[View Live CRM System](https://yourusername.github.io/sanicrete-crm-dashboard/)**

## ✨ Key Features

### 🎯 Interactive Web Interface
- **Click-to-edit** company notes, status, and priorities
- **Drag-and-drop** pipeline management (Lead → Qualified → Quoted → Won/Lost)
- **One-click scheduling** for follow-ups (1 week, 2 weeks, 1 month)
- **Quick status changes** (Hot/Warm/Cold)
- **Inline editing** of contact information
- **Bulk operations** (select multiple companies)

### 🤖 Automation Engine
- **Auto-create OpenClaw cron reminders** when follow-ups are scheduled
- **Integration** with Tyler's existing cron system
- **Auto-update lead scores** based on email activity
- **Pipeline progression alerts**
- **Overdue follow-up notifications**

### 🧠 Smart Filtering (CRITICAL)
- **Analyzes email CONTENT and CONTEXT**, not just names
- **Excludes promotional/service emails** (Bass Pro, Google notifications)
- **Focuses on REAL construction/industrial prospects**
- **Two-way business conversations only**
- **Project discussions, quotes, technical conversations**

### 💼 Workflow Features
- **Email template generator** for follow-ups
- **Quote tracking and reminder system**
- **Project pipeline visualization**
- **Contact frequency recommendations**
- **Advanced search and filtering**

### 🛠️ Technical Implementation
- **React/Next.js** web application
- **GitHub Pages** hosted deployment
- **API endpoints** for OpenClaw integration
- **Local data storage** with cloud sync capability
- **Mobile-responsive** design

## 📊 What Makes This Different

Unlike static dashboards, this is a **WORKING BUSINESS TOOL** that:

- ✅ **Processes real data** from Tyler-CRM-Dashboard-Files
- ✅ **Filters intelligently** for actual business prospects
- ✅ **Enables interaction** - not just viewing
- ✅ **Automates workflows** through OpenClaw integration
- ✅ **Manages relationships** end-to-end

## 🎯 Business Impact

### Before (Static Dashboards)
- ❌ 3,656 companies with heavy promotional noise
- ❌ Difficult to identify real prospects
- ❌ No interaction capabilities
- ❌ Manual follow-up tracking

### After (Interactive CRM)
- ✅ **886 filtered quality prospects** (76% noise reduction)
- ✅ **319 recently active opportunities**
- ✅ **Full interaction** - drag, drop, edit, schedule
- ✅ **Automated workflow** integration with OpenClaw

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sanicrete-crm-dashboard.git
cd sanicrete-crm-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the CRM system in action.

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
sanicrete-crm-dashboard/
├── src/
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   │   ├── Dashboard.tsx       # Main dashboard layout
│   │   ├── Pipeline.tsx        # Drag-and-drop pipeline
│   │   ├── CompanyCard.tsx     # Interactive company cards
│   │   ├── FilterPanel.tsx     # Advanced filtering
│   │   ├── BulkOperations.tsx  # Bulk actions toolbar
│   │   ├── CompanyList.tsx     # Tabular company view
│   │   ├── Analytics.tsx       # Business analytics
│   │   ├── Automation.tsx      # Automation rules
│   │   └── Settings.tsx        # System configuration
│   ├── context/
│   │   └── CrmContext.tsx      # Global state management
│   ├── types/
│   │   └── crm.ts             # TypeScript interfaces
│   └── lib/
│       └── crm-utils.ts       # Utility functions
├── public/
│   └── crm-data.json          # CRM data source
└── .github/workflows/
    └── deploy.yml             # GitHub Pages deployment
```

## 🎮 How to Use

### 1. Pipeline Management
- **Drag companies** between pipeline stages (Lead, Qualified, Quoted, Won, Lost)
- **Click to edit** company information inline
- **Quick priority changes** by clicking priority badges

### 2. Bulk Operations
- **Select multiple companies** using checkboxes
- **Apply bulk actions**: status changes, priority updates, follow-up scheduling
- **Mass operations** for efficient workflow management

### 3. Smart Filtering
- **Search across** company names, contacts, notes, and email content
- **Filter by category**, status, priority, score range
- **Date range filtering** for recent activity
- **Advanced filters** for targeted prospect identification

### 4. Follow-up Management
- **One-click scheduling** for 1 week, 2 weeks, or 1 month follow-ups
- **Automatic cron job creation** in OpenClaw (when configured)
- **Overdue task notifications**
- **Follow-up completion tracking**

### 5. Analytics & Reporting
- **Pipeline visualizations** with real-time data
- **Lead score distributions** and trending
- **Activity metrics** and engagement tracking
- **Top performer identification**

## 🔧 OpenClaw Integration

### Configuration
1. Go to **Settings** → **Integration**
2. Set your **OpenClaw Webhook URL**
3. Configure **Cron Job Endpoint**
4. Enable **Automation**

### Features
- **Automatic cron job creation** for follow-up reminders
- **Notification delivery** through OpenClaw interface
- **Task synchronization** with existing workflows
- **Webhook-based** real-time updates

### API Endpoints

```bash
# Create cron job
POST /api/openclaw/cron
{
  "schedule": "0 9 * * 1",
  "command": "crm-followup-reminder", 
  "data": { "companyId": "...", "type": "1_week" }
}

# Send notification
POST /api/notifications
{
  "type": "crm_alert",
  "message": "High-value lead detected",
  "companyId": "..."
}
```

## 📊 Data Processing

### Smart Email Filtering

The system intelligently processes email data to identify **real business prospects**:

#### ✅ Includes:
- Construction/industrial/food processing discussions
- Project quotes, bids, technical conversations
- Facility management communications
- Two-way business relationships
- Equipment and material inquiries

#### ❌ Excludes:
- Promotional emails (Bass Pro Shops, retail marketing)
- Service notifications (Google, utilities, banks)
- Consumer marketing emails
- Software/service updates
- One-way promotional content

### Lead Scoring Algorithm

```javascript
// Scoring factors
const score = 
  (businessKeywords * 10) +
  (conversationQuality * 5) +
  (emailFrequency * 2) +
  (industryRelevance * 15) +
  (recentActivity * 20);
```

## 🚀 Deployment

### GitHub Pages (Automatic)

1. **Fork this repository**
2. **Enable GitHub Pages** in repository settings
3. **Push to main branch** - automatic deployment via GitHub Actions
4. **Access at**: `https://yourusername.github.io/sanicrete-crm-dashboard/`

### Manual Deployment

```bash
# Build static export
npm run build

# Deploy the 'out' directory to your hosting provider
# Files are ready for static hosting (Netlify, Vercel, etc.)
```

## 🔧 Customization

### Adding New Pipeline Stages

```typescript
// Update PIPELINE_STAGES in Pipeline.tsx
const PIPELINE_STAGES = [
  { id: 'Lead', name: 'Leads', color: 'bg-blue-100' },
  { id: 'Qualified', name: 'Qualified', color: 'bg-yellow-100' },
  { id: 'Quoted', name: 'Quoted', color: 'bg-purple-100' },
  { id: 'Negotiating', name: 'Negotiating', color: 'bg-orange-100' }, // New stage
  { id: 'Won', name: 'Won', color: 'bg-green-100' },
  { id: 'Lost', name: 'Lost', color: 'bg-red-100' },
];
```

### Custom Automation Rules

```typescript
// Add automation rules in Automation.tsx
const newRule: AutomationRule = {
  name: 'High Score Auto-Qualify',
  trigger: { type: 'score_change', conditions: { minScore: 1500 } },
  actions: [
    { type: 'update_status', data: { newStatus: 'Qualified' } },
    { type: 'create_follow_up', data: { type: '1_week' } }
  ]
};
```

### Email Filter Patterns

```typescript
// Customize filtering in Settings
emailFilters: {
  excludePatterns: ['newsletter', 'promo', 'marketing'],
  businessKeywords: ['flooring', 'concrete', 'epoxy', 'construction'],
  industrialTerms: ['food processing', 'manufacturing', 'warehouse']
}
```

## 📈 Performance

- **Load time**: < 2 seconds for 886+ prospects
- **Real-time updates**: Drag-and-drop with immediate persistence
- **Responsive design**: Works on desktop, tablet, and mobile
- **Optimized rendering**: Virtual scrolling for large datasets
- **Efficient filtering**: Client-side processing with smart caching

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📝 License

This project is proprietary software developed specifically for SaniCrete's business operations.

## 🆘 Support

For technical support or feature requests:

- **Issues**: [GitHub Issues](https://github.com/yourusername/sanicrete-crm-dashboard/issues)
- **Email**: support@sanicrete.com
- **Documentation**: [Wiki](https://github.com/yourusername/sanicrete-crm-dashboard/wiki)

## 🎯 Roadmap

### Phase 1 ✅ (Current)
- [x] Interactive pipeline management
- [x] Smart email filtering
- [x] Bulk operations
- [x] OpenClaw integration framework
- [x] Advanced analytics

### Phase 2 🚧 (In Progress)
- [ ] Real-time collaboration
- [ ] Mobile app companion
- [ ] Advanced reporting dashboard
- [ ] Integration with accounting systems

### Phase 3 📅 (Planned)
- [ ] AI-powered lead scoring
- [ ] Predictive analytics
- [ ] Voice notes and transcription
- [ ] Document management system

---

**Built for SaniCrete** - Transforming business relationships through intelligent CRM technology 🏗️