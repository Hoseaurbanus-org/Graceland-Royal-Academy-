import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  Building,
  Star,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { SchoolAccountForm } from './SchoolAccountForm';
import { 
  getAccountStatusLabel, 
  getAccountStatusColor, 
  sortAccountsByPriority,
  maskAccountNumber
} from './school-account-utils';

interface SchoolAccountManagerProps {
  accounts: any[];
  onAddAccount: (accountData: any) => void;
  onUpdateAccount: (id: string, updates: any) => void;
  onDeleteAccount: (id: string) => void;
}

export function SchoolAccountManager({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount
}: SchoolAccountManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({});

  const sortedAccounts = sortAccountsByPriority(accounts);
  const primaryAccount = accounts.find(acc => acc.isPrimary && acc.isActive);

  const handleAddAccount = async (accountData: any) => {
    try {
      await onAddAccount(accountData);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleUpdateAccount = async (accountData: any) => {
    if (!editingAccount) return;
    
    try {
      await onUpdateAccount(editingAccount.id, accountData);
      setEditingAccount(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    if (deleteConfirm === accountId) {
      onDeleteAccount(accountId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(accountId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const toggleAccountNumber = (accountId: string) => {
    setShowAccountNumbers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                School Bank Accounts
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage banking information for fee payments
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Primary Account Alert */}
          {primaryAccount && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Star className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Primary Account:</strong> {primaryAccount.bankName} - {primaryAccount.accountName}
                    <div className="text-sm mt-1">
                      This account information is displayed to parents for fee payments.
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Active
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* No Accounts State */}
          {accounts.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground mb-4">No bank accounts configured</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Account
              </Button>
            </div>
          )}

          {/* Accounts Table */}
          {accounts.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank & Account</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {account.bankName}
                            {account.isPrimary && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {account.accountName}
                          </div>
                          {account.description && (
                            <div className="text-xs text-muted-foreground">
                              {account.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {showAccountNumbers[account.id] 
                              ? account.accountNumber 
                              : maskAccountNumber(account.accountNumber)
                            }
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAccountNumber(account.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showAccountNumbers[account.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {account.sortCode && (
                          <div className="text-xs text-muted-foreground font-mono">
                            Sort: {account.sortCode}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getAccountStatusColor(account.isActive, account.isPrimary)}>
                            {getAccountStatusLabel(account.isActive, account.isPrimary)}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden sm:table-cell">
                        <div className="text-sm text-muted-foreground">
                          {new Date(account.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          by {account.updatedBy}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAccount(account)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={deleteConfirm === account.id ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                            disabled={account.isPrimary && account.isActive}
                            className="h-8 w-8 p-0"
                          >
                            {deleteConfirm === account.id ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {account.isPrimary && account.isActive && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Cannot delete primary
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Warning about no primary account */}
          {accounts.length > 0 && !primaryAccount && (
            <Alert className="mt-4 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                No primary account is set. Parents won't see banking information for fee payments.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Account Form Dialog */}
      <SchoolAccountForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSave={editingAccount ? handleUpdateAccount : handleAddAccount}
        editingAccount={editingAccount}
        existingAccounts={accounts}
      />
    </>
  );
}