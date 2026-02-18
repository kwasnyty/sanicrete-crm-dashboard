#!/usr/bin/env python3
"""
SaniCrete CRM System Test Suite
Validates all CRM functionality and demonstrates key features
"""

import json
import os
import sys
from datetime import datetime

def test_data_loading():
    """Test CRM data loading functionality"""
    print("🧪 Testing CRM data loading...")
    
    try:
        # Test main data file
        with open('filtered_crm_data.json', 'r') as f:
            data = json.load(f)
        
        prospects = data.get('filtered_prospects', {})
        print(f"✅ Loaded {len(prospects)} prospects successfully")
        
        # Test summary stats
        stats = data.get('summary_stats', {})
        print(f"✅ Summary stats loaded: {stats.get('total_prospects', 0)} total")
        
        return True
    except Exception as e:
        print(f"❌ Data loading failed: {e}")
        return False

def test_email_templates():
    """Test email template system"""
    print("📧 Testing email template system...")
    
    try:
        with open('email-templates.json', 'r') as f:
            templates = json.load(f)
        
        template_count = len(templates.get('templates', {}))
        print(f"✅ Loaded {template_count} email templates")
        
        # Test template structure
        for name, template in templates['templates'].items():
            if 'subject' not in template or 'body' not in template:
                print(f"❌ Template {name} missing required fields")
                return False
        
        print("✅ All templates have required fields")
        return True
        
    except Exception as e:
        print(f"❌ Email template test failed: {e}")
        return False

def test_user_data_system():
    """Test user data persistence"""
    print("💾 Testing user data system...")
    
    try:
        # Create user data directory if it doesn't exist
        os.makedirs('user_data', exist_ok=True)
        
        # Test data creation
        test_data = {
            'status': 'hot',
            'notes': 'Test prospect for CRM validation',
            'priority_tags': ['urgent', 'large_project'],
            'next_followup': datetime.now().isoformat(),
            'test_created': datetime.now().isoformat()
        }
        
        test_file = 'user_data/test_company.json'
        with open(test_file, 'w') as f:
            json.dump(test_data, f, indent=2)
        
        # Test data reading
        with open(test_file, 'r') as f:
            loaded_data = json.load(f)
        
        if loaded_data['status'] == 'hot':
            print("✅ User data write/read successful")
            os.remove(test_file)  # Cleanup
            return True
        else:
            print("❌ User data integrity check failed")
            return False
            
    except Exception as e:
        print(f"❌ User data test failed: {e}")
        return False

def test_automation_functions():
    """Test automation functions"""
    print("🤖 Testing automation functions...")
    
    try:
        # Import the automation module
        sys.path.append('.')
        import crm_automations
        CRMAutomations = crm_automations.CRMAutomations
        
        crm = CRMAutomations()
        
        # Test data loading
        prospects = crm.load_crm_data()
        if len(prospects) > 0:
            print(f"✅ Automation can load {len(prospects)} prospects")
        else:
            print("❌ Automation data loading failed")
            return False
        
        # Test scoring algorithm
        test_prospect = list(prospects.values())[0]
        test_user_data = {'status': 'warm', 'priority_tags': ['urgent']}
        
        score = crm.calculate_auto_score(test_prospect, test_user_data)
        if score > 0:
            print(f"✅ Lead scoring algorithm working (test score: {score})")
        else:
            print("❌ Lead scoring algorithm failed")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Automation test failed: {e}")
        return False

def test_web_files():
    """Test web interface files"""
    print("🌐 Testing web interface files...")
    
    required_files = [
        'crm-system.html',
        'crm-system.js',
        'index.html'
    ]
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file} exists")
        else:
            print(f"❌ {file} missing")
            return False
    
    # Test HTML file structure
    try:
        with open('crm-system.html', 'r') as f:
            content = f.read()
        
        required_elements = [
            '<title>SaniCrete CRM System',
            'class="crm-container"',
            'id="prospectsGrid"',
            'crm-system.js'
        ]
        
        for element in required_elements:
            if element in content:
                print(f"✅ HTML contains required element: {element}")
            else:
                print(f"❌ HTML missing element: {element}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Web file test failed: {e}")
        return False

def demonstrate_key_features():
    """Demonstrate key CRM features"""
    print("\n🎯 DEMONSTRATING KEY CRM FEATURES:")
    print("=" * 50)
    
    # Load sample data
    with open('filtered_crm_data.json', 'r') as f:
        data = json.load(f)
    
    prospects = data['filtered_prospects']
    
    # Show top prospects
    print("\n🏆 TOP 5 PROSPECTS BY QUALITY SCORE:")
    sorted_prospects = sorted(prospects.items(), 
                            key=lambda x: x[1].get('overall_score', 0), 
                            reverse=True)
    
    for i, (name, prospect) in enumerate(sorted_prospects[:5], 1):
        print(f"{i}. {name}")
        print(f"   Category: {prospect.get('category', 'Unknown')}")
        print(f"   Score: {prospect.get('overall_score', 0)}")
        print(f"   Emails: {prospect.get('total_emails', 0)}")
        if prospect.get('relevant_emails'):
            print(f"   Key Email: \"{prospect['relevant_emails'][0]['subject'][:60]}...\"")
        print()
    
    # Show category breakdown
    categories = {}
    for prospect in prospects.values():
        cat = prospect.get('category', 'Unknown')
        categories[cat] = categories.get(cat, 0) + 1
    
    print("📊 PROSPECT CATEGORIES:")
    for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"   {category}: {count} prospects")
    
    print(f"\n🎯 FILTERED RESULTS:")
    print(f"   Original companies: 3,656")
    print(f"   Quality prospects: {len(prospects)}")
    print(f"   Noise reduction: {((3656 - len(prospects)) / 3656) * 100:.1f}%")
    
    print(f"\n📧 EMAIL TEMPLATES AVAILABLE:")
    with open('email-templates.json', 'r') as f:
        templates = json.load(f)
    
    for name, template in templates['templates'].items():
        print(f"   • {name.replace('_', ' ').title()}: {template['subject']}")
    
    print(f"\n🤖 AUTOMATION FEATURES:")
    print(f"   • Daily overdue follow-up alerts")
    print(f"   • Automatic lead score updates")
    print(f"   • Weekly pipeline reports")
    print(f"   • OpenClaw cron integration")
    print(f"   • Email template generation")

def run_full_test_suite():
    """Run complete CRM test suite"""
    print("🚀 SaniCrete CRM System Test Suite")
    print("=" * 40)
    print()
    
    tests = [
        ("Data Loading", test_data_loading),
        ("Email Templates", test_email_templates),
        ("User Data System", test_user_data_system),
        ("Web Interface Files", test_web_files),
        ("Automation Functions", test_automation_functions)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed!")
    
    print(f"\n🏁 TEST RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! CRM system is ready for use.")
        demonstrate_key_features()
        
        print(f"\n🚀 NEXT STEPS:")
        print(f"   1. Run: ./start-crm.sh")
        print(f"   2. Visit: http://localhost:8000/crm-system.html")
        print(f"   3. Start managing your prospects!")
        
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = run_full_test_suite()
    sys.exit(0 if success else 1)