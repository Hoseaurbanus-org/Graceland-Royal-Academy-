import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { 
  Globe, 
  Settings, 
  Users, 
  BarChart3, 
  Edit, 
  Save, 
  Eye,
  EyeOff,
  Upload,
  Download,
  RefreshCw,
  Calendar,
  Bell,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  Award,
  Trash2,
  Plus,
  Image,
  FileText,
  ExternalLink,
  Shield,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { RealTimeSync } from './RealTimeSync';
import { toast } from 'sonner@2.0.3';

// Types for website content management
interface WebsiteContent {
  id: string;
  section: 'hero' | 'about' | 'news' | 'events' | 'contact';
  title: string;
  content: string;
  lastModified: string;
  author: string;
  status: 'published' | 'draft' | 'scheduled';
}

interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  showTestimonials: boolean;
}

// Content Editor Component
function ContentEditor({ 
  content, 
  onSave, 
  onCancel 
}: { 
  content: WebsiteContent; 
  onSave: (content: WebsiteContent) => void;
  onCancel: () => void;
}) {
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave({
        ...editedContent,
        lastModified: new Date().toISOString(),
        author: 'Current User'
      });
      
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          Edit {content.section} Content
        </CardTitle>
        <CardDescription>
          Last modified: {new Date(content.lastModified).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg bg-input-background"
            value={editedContent.title}
            onChange={(e) => setEditedContent({...editedContent, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <Textarea
            className="w-full min-h-[200px] bg-input-background"
            value={editedContent.content}
            onChange={(e) => setEditedContent({...editedContent, content: e.target.value})}
            placeholder="Enter content here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full p-2 border rounded-lg bg-input-background"
            value={editedContent.status}
            onChange={(e) => setEditedContent({...editedContent, status: e.target.value as any})}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
          
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Website Analytics Dashboard
function WebsiteAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalVisitors: 12847,
    uniqueVisitors: 8932,
    pageViews: 45382,
    bounceRate: 32.5,
    avgSessionTime: '3m 42s',
    topPages: [
      { page: '/', views: 18500, conversions: 85 },
      { page: '/admissions', views: 8200, conversions: 156 },
      { page: '/academics', views: 6800, conversions: 23 },
      { page: '/about', views: 5200, conversions: 12 },
      { page: '/contact', views: 3400, conversions: 78 }
    ],
    recentActivity: [
      { type: 'application', message: 'New admission application received', time: '2 min ago' },
      { type: 'inquiry', message: 'Contact form submitted from parent', time: '5 min ago' },
      { type: 'visit', message: '15 new visitors in the last hour', time: '1 hour ago' }
    ]
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 24,
    newApplications: 3,
    contactSubmissions: 7
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 6) - 3),
        newApplications: prev.newApplications + Math.floor(Math.random() * 2),
        contactSubmissions: prev.contactSubmissions + Math.floor(Math.random() * 2)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{realTimeMetrics.activeUsers}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications Today</p>
                <p className="text-2xl font-bold text-blue-600">{realTimeMetrics.newApplications}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inquiries Today</p>
                <p className="text-2xl font-bold text-purple-600">{realTimeMetrics.contactSubmissions}</p>
              </div>
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
            <CardDescription>Website performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{analytics.totalVisitors.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Visitors</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Unique Visitors</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{analytics.pageViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Page Views</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{analytics.bounceRate}%</div>
                <div className="text-sm text-muted-foreground">Bounce Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages and conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{page.page === '/' ? 'Homepage' : page.page}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{page.views.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{page.conversions} conversions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest website interactions and submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                {activity.type === 'application' && <FileText className="h-4 w-4 text-blue-500" />}
                {activity.type === 'inquiry' && <Mail className="h-4 w-4 text-green-500" />}
                {activity.type === 'visit' && <Users className="h-4 w-4 text-purple-500" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Site Settings Management
function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Graceland Royal Academy',
    tagline: 'Wisdom & Illumination',
    description: 'Premier educational institution committed to academic excellence and character development.',
    contactEmail: 'info@gracelandroyal.edu.ng',
    contactPhone: '+234 801 234 5678',
    address: '123 Education Avenue, Wisdom Gardens, Lagos State, Nigeria',
    socialMedia: {
      facebook: 'https://facebook.com/gracelandroyal',
      twitter: 'https://twitter.com/gracelandroyal',
      instagram: 'https://instagram.com/gracelandroyal'
    },
    maintenanceMode: false,
    allowRegistrations: true,
    showTestimonials: true
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core website information and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg bg-input-background"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg bg-input-background"
                value={settings.tagline}
                onChange={(e) => setSettings({...settings, tagline: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              className="w-full bg-input-background"
              value={settings.description}
              onChange={(e) => setSettings({...settings, description: e.target.value})}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Contact details displayed on the website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                className="w-full p-2 border rounded-lg bg-input-background"
                value={settings.contactEmail}
                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full p-2 border rounded-lg bg-input-background"
                value={settings.contactPhone}
                onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Textarea
              className="w-full bg-input-background"
              value={settings.address}
              onChange={(e) => setSettings({...settings, address: e.target.value})}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Social media profiles and links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Facebook</label>
            <input
              type="url"
              className="w-full p-2 border rounded-lg bg-input-background"
              value={settings.socialMedia.facebook}
              onChange={(e) => setSettings({
                ...settings, 
                socialMedia: {...settings.socialMedia, facebook: e.target.value}
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Twitter</label>
            <input
              type="url"
              className="w-full p-2 border rounded-lg bg-input-background"
              value={settings.socialMedia.twitter}
              onChange={(e) => setSettings({
                ...settings, 
                socialMedia: {...settings.socialMedia, twitter: e.target.value}
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <input
              type="url"
              className="w-full p-2 border rounded-lg bg-input-background"
              value={settings.socialMedia.instagram}
              onChange={(e) => setSettings({
                ...settings, 
                socialMedia: {...settings.socialMedia, instagram: e.target.value}
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site Features</CardTitle>
          <CardDescription>Control website functionality and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Maintenance Mode</h4>
              <p className="text-sm text-muted-foreground">
                Display maintenance message to visitors
              </p>
            </div>
            <Button
              variant={settings.maintenanceMode ? "destructive" : "outline"}
              onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
            >
              {settings.maintenanceMode ? 'Active' : 'Inactive'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Allow New Registrations</h4>
              <p className="text-sm text-muted-foreground">
                Accept new admission applications
              </p>
            </div>
            <Button
              variant={settings.allowRegistrations ? "default" : "outline"}
              onClick={() => setSettings({...settings, allowRegistrations: !settings.allowRegistrations})}
            >
              {settings.allowRegistrations ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show Testimonials</h4>
              <p className="text-sm text-muted-foreground">
                Display parent and student testimonials
              </p>
            </div>
            <Button
              variant={settings.showTestimonials ? "default" : "outline"}
              onClick={() => setSettings({...settings, showTestimonials: !settings.showTestimonials})}
            >
              {settings.showTestimonials ? 'Visible' : 'Hidden'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full gap-2"
        size="lg"
      >
        {isSaving ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save All Settings
      </Button>
    </div>
  );
}

// Content Management System
function ContentManagement() {
  const [contents, setContents] = useState<WebsiteContent[]>([
    {
      id: '1',
      section: 'hero',
      title: 'Welcome to Graceland Royal Academy',
      content: 'Premier educational institution...',
      lastModified: new Date().toISOString(),
      author: 'Admin',
      status: 'published'
    },
    {
      id: '2',
      section: 'about',
      title: 'About Our School',
      content: 'Founded in 1999...',
      lastModified: new Date().toISOString(),
      author: 'Admin',
      status: 'published'
    }
  ]);

  const [editingContent, setEditingContent] = useState<WebsiteContent | null>(null);

  const handleSaveContent = (updatedContent: WebsiteContent) => {
    setContents(prev => 
      prev.map(content => 
        content.id === updatedContent.id ? updatedContent : content
      )
    );
    setEditingContent(null);
  };

  const handleDeleteContent = (id: string) => {
    setContents(prev => prev.filter(content => content.id !== id));
    toast.success('Content deleted successfully');
  };

  if (editingContent) {
    return (
      <ContentEditor
        content={editingContent}
        onSave={handleSaveContent}
        onCancel={() => setEditingContent(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage website content and pages</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Content
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{content.section}</CardTitle>
                <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                  {content.status}
                </Badge>
              </div>
              <CardDescription>
                Last modified: {new Date(content.lastModified).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">{content.title}</h4>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {content.content}
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingContent(content)}
                  className="gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteContent(content.id)}
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Website Admin Component
export function WebsiteAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');

  if (user?.role !== 'admin') {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Website administration is available for administrators only.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Website Administration
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor the school website with real-time analytics and content control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3 text-green-500" />
            Website Online
          </Badge>
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            View Website
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="analytics" key="analytics">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WebsiteAnalytics />
            </motion.div>
          </TabsContent>

          <TabsContent value="content" key="content">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ContentManagement />
            </motion.div>
          </TabsContent>

          <TabsContent value="settings" key="settings">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SiteSettingsManager />
            </motion.div>
          </TabsContent>

          <TabsContent value="sync" key="sync">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RealTimeSync />
            </motion.div>
          </TabsContent>

          <TabsContent value="media" key="media">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Media Management
                  </CardTitle>
                  <CardDescription>
                    Upload and manage images, documents, and other media files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Media Library</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload and organize media files for your website
                    </p>
                    <Button className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Media
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

export default WebsiteAdmin;