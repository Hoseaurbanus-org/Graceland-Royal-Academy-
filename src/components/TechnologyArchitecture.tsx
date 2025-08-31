import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Shield, 
  Database, 
  Cloud, 
  Zap, 
  Lock, 
  Users,
  BarChart3,
  Bell,
  FileText,
  Server,
  Globe,
  Smartphone
} from 'lucide-react';

export function TechnologyArchitecture() {
  const techStack = {
    frontend: [
      { name: 'React 18', purpose: 'UI Framework', icon: '⚛️' },
      { name: 'TypeScript', purpose: 'Type Safety', icon: '🔷' },
      { name: 'Tailwind CSS', purpose: 'Styling', icon: '🎨' },
      { name: 'Chart.js', purpose: 'Data Visualization', icon: '📊' },
      { name: 'Radix UI', purpose: 'Accessible Components', icon: '🔧' }
    ],
    backend: [
      { name: 'Node.js', purpose: 'Runtime Environment', icon: '🟢' },
      { name: 'Express.js', purpose: 'Web Framework', icon: '🚀' },
      { name: 'Socket.io', purpose: 'Real-time Communication', icon: '⚡' },
      { name: 'JWT', purpose: 'Authentication', icon: '🔐' },
      { name: 'Bcrypt', purpose: 'Password Hashing', icon: '🔒' }
    ],
    database: [
      { name: 'PostgreSQL', purpose: 'Primary Database', icon: '🐘' },
      { name: 'Redis', purpose: 'Caching & Sessions', icon: '🔴' },
      { name: 'MongoDB', purpose: 'Document Storage', icon: '🍃' }
    ],
    infrastructure: [
      { name: 'Docker', purpose: 'Containerization', icon: '🐳' },
      { name: 'Kubernetes', purpose: 'Orchestration', icon: '☸️' },
      { name: 'AWS/Azure', purpose: 'Cloud Platform', icon: '☁️' },
      { name: 'Nginx', purpose: 'Load Balancer', icon: '🔄' }
    ]
  };

  const securityFeatures = [
    {
      title: 'Role-Based Access Control (RBAC)',
      description: 'Granular permissions for admins, teachers, students, and parents',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Data Encryption',
      description: 'AES-256 encryption for data at rest and TLS 1.3 for data in transit',
      icon: <Lock className="h-5 w-5" />
    },
    {
      title: 'Audit Logging',
      description: 'Comprehensive logging of all user actions and system events',
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: 'GDPR Compliance',
      description: 'Data protection, right to erasure, and consent management',
      icon: <Shield className="h-5 w-5" />
    }
  ];

  const systemFeatures = [
    {
      title: 'Real-time Processing',
      description: 'Instant calculation and validation upon score submission',
      icon: <Zap className="h-5 w-5" />,
      technical: 'WebSocket connections, event-driven architecture'
    },
    {
      title: 'Automated Notifications',
      description: 'Multi-channel alerts via email, SMS, and in-app notifications',
      icon: <Bell className="h-5 w-5" />,
      technical: 'Queue-based notification system with retry logic'
    },
    {
      title: 'Data Visualization',
      description: 'Interactive charts and analytics dashboards',
      icon: <BarChart3 className="h-5 w-5" />,
      technical: 'Chart.js integration with real-time data binding'
    },
    {
      title: 'Scalable Architecture',
      description: 'Microservices design supporting thousands of concurrent users',
      icon: <Cloud className="h-5 w-5" />,
      technical: 'Horizontal scaling, load balancing, auto-scaling'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Technology Architecture</h2>
        <p className="text-muted-foreground">
          Comprehensive system design for scalable, secure, and compliant result compilation
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="stack">Technology Stack</TabsTrigger>
          <TabsTrigger value="security">Security & Compliance</TabsTrigger>
          <TabsTrigger value="deployment">Deployment & Scaling</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  System Architecture
                </CardTitle>
                <CardDescription>High-level system design and components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{feature.description}</p>
                        <p className="text-xs text-blue-600">{feature.technical}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  System Capabilities
                </CardTitle>
                <CardDescription>Key features and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">99.9%</div>
                      <p className="text-sm text-muted-foreground">Uptime SLA</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">&lt;2s</div>
                      <p className="text-sm text-muted-foreground">Response Time</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">10K+</div>
                      <p className="text-sm text-muted-foreground">Concurrent Users</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">24/7</div>
                      <p className="text-sm text-muted-foreground">Monitoring</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Supported Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>Web Browser</span>
                      </Badge>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Smartphone className="h-3 w-3" />
                        <span>Mobile Responsive</span>
                      </Badge>
                      <Badge variant="outline">PWA Support</Badge>
                      <Badge variant="outline">Offline Capable</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stack">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(techStack).map(([category, technologies]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category}</CardTitle>
                  <CardDescription>
                    {category === 'frontend' && 'User interface and client-side technologies'}
                    {category === 'backend' && 'Server-side processing and API services'}
                    {category === 'database' && 'Data storage and management systems'}
                    {category === 'infrastructure' && 'Deployment and scaling technologies'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {technologies.map((tech, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{tech.icon}</span>
                          <span className="font-medium">{tech.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {tech.purpose}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Features
                </CardTitle>
                <CardDescription>Comprehensive security measures and compliance standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Privacy Compliance</CardTitle>
                  <CardDescription>GDPR and educational data protection standards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Data Minimization</span>
                      <Badge variant="default">✓ Implemented</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Consent Management</span>
                      <Badge variant="default">✓ Implemented</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Right to Erasure</span>
                      <Badge variant="default">✓ Implemented</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Data Portability</span>
                      <Badge variant="default">✓ Implemented</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Breach Notification</span>
                      <Badge variant="default">✓ Automated</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Control Matrix</CardTitle>
                  <CardDescription>Role-based permissions and data access</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Resource</th>
                          <th className="text-center p-2">Admin</th>
                          <th className="text-center p-2">Teacher</th>
                          <th className="text-center p-2">Parent</th>
                          <th className="text-center p-2">Student</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b">
                          <td className="p-2">Score Input</td>
                          <td className="text-center p-2">✓</td>
                          <td className="text-center p-2">✓</td>
                          <td className="text-center p-2">✗</td>
                          <td className="text-center p-2">✗</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">View Results</td>
                          <td className="text-center p-2">✓</td>
                          <td className="text-center p-2">✓</td>
                          <td className="text-center p-2">✓</td>
                          <td className="text-center p-2">✓</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Print Reports</td>
                          <td className="text-center p-2">✓</td>
                          <td className="text-center p-2">✗</td>
                          <td className="text-center p-2">✗</td>
                          <td className="text-center p-2">✗</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">System Config</td>
                          <td className="text-center p-2">✓</td>
                          <td className="text-center p-2">✗</td>
                          <td className="text-center p-2">✗</td>
                          <td className="text-center p-2">✗</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deployment">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cloud className="h-5 w-5 mr-2" />
                  Deployment Architecture
                </CardTitle>
                <CardDescription>Scalable cloud infrastructure and deployment strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border-2 border-dashed border-blue-300 rounded-lg">
                      <h4 className="font-medium mb-2">Development</h4>
                      <p className="text-sm text-muted-foreground">
                        Local development with Docker Compose
                      </p>
                      <Badge variant="outline" className="mt-2">Auto-deploy</Badge>
                    </div>
                    <div className="text-center p-4 border-2 border-dashed border-orange-300 rounded-lg">
                      <h4 className="font-medium mb-2">Staging</h4>
                      <p className="text-sm text-muted-foreground">
                        Pre-production testing environment
                      </p>
                      <Badge variant="outline" className="mt-2">Manual review</Badge>
                    </div>
                    <div className="text-center p-4 border-2 border-dashed border-green-300 rounded-lg">
                      <h4 className="font-medium mb-2">Production</h4>
                      <p className="text-sm text-muted-foreground">
                        Multi-region deployment with failover
                      </p>
                      <Badge variant="default" className="mt-2">Blue-green</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scalability Features</CardTitle>
                  <CardDescription>Horizontal and vertical scaling capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Auto-scaling Groups</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Load Balancing</span>
                      <Badge variant="default">Multi-AZ</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Database Clustering</span>
                      <Badge variant="default">Master-Slave</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>CDN Integration</span>
                      <Badge variant="default">Global</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Caching Layer</span>
                      <Badge variant="default">Redis Cluster</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monitoring & Observability</CardTitle>
                  <CardDescription>Comprehensive system monitoring and alerting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Application Metrics</span>
                      <Badge variant="outline">Prometheus</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Log Aggregation</span>
                      <Badge variant="outline">ELK Stack</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Error Tracking</span>
                      <Badge variant="outline">Sentry</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Performance Monitoring</span>
                      <Badge variant="outline">New Relic</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>Health Checks</span>
                      <Badge variant="outline">Automated</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Data Backup & Recovery:</strong> Automated daily backups with point-in-time recovery. 
                Multi-region replication ensures 99.99% data durability with RPO &lt; 1 hour and RTO &lt; 15 minutes.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}