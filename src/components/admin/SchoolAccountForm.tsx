import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Save, X, AlertTriangle, CreditCard, Building, Shield } from 'lucide-react';
import { BANK_NAMES, DEFAULT_SCHOOL_ACCOUNT } from './school-account-constants';
import { validateAccountForm, formatAccountNumber, formatSortCode } from './school-account-utils';

interface SchoolAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: any) => void;
  editingAccount?: any;
  existingAccounts: any[];
}

export function SchoolAccountForm({
  isOpen,
  onClose,
  onSave,
  editingAccount,
  existingAccounts
}: SchoolAccountFormProps) {
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_SCHOOL_ACCOUNT,
    ...(editingAccount || {})
  }));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const errors = validateAccountForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // If setting as primary, warn about existing primary accounts
      if (formData.isPrimary && !editingAccount) {
        const hasPrimary = existingAccounts.some(acc => acc.isPrimary && acc.isActive);
        if (hasPrimary) {
          const confirm = window.confirm(
            'Setting this account as primary will deactivate the current primary account. Continue?'
          );
          if (!confirm) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      await onSave(formData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ ...DEFAULT_SCHOOL_ACCOUNT });
    setFormErrors({});
  };

  const handleAccountNumberChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, accountNumber: formatted }));
  };

  const handleSortCodeChange = (value: string) => {
    const formatted = formatSortCode(value);
    setFormData(prev => ({ ...prev, sortCode: formatted }));
  };

  React.useEffect(() => {
    if (editingAccount) {
      setFormData({ ...DEFAULT_SCHOOL_ACCOUNT, ...editingAccount });
    } else {
      resetForm();
    }
  }, [editingAccount, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            {editingAccount ? 'Edit School Account' : 'Add School Account'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {editingAccount ? 'Update banking information' : 'Add new school bank account for fee payments'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-1">
          {/* Bank Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm border-b pb-2">Bank Information</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName" className="text-sm">Bank Name *</Label>
                <Select 
                  value={formData.bankName} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bankName: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_NAMES.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.bankName && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.bankName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="accountName" className="text-sm">Account Name *</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="School account name"
                  className="mt-1"
                />
                {formErrors.accountName && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.accountName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountNumber" className="text-sm">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  placeholder="10-digit account number"
                  className="mt-1"
                  maxLength={10}
                />
                {formErrors.accountNumber && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.accountNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sortCode" className="text-sm">Sort Code (Optional)</Label>
                <Input
                  id="sortCode"
                  value={formData.sortCode}
                  onChange={(e) => handleSortCodeChange(e.target.value)}
                  placeholder="XXX-XXX-XXX"
                  className="mt-1"
                />
                {formErrors.sortCode && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.sortCode}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="routingNumber" className="text-sm">Routing Number (Optional)</Label>
                <Input
                  id="routingNumber"
                  value={formData.routingNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                  placeholder="For international transfers"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="swiftCode" className="text-sm">SWIFT Code (Optional)</Label>
                <Input
                  id="swiftCode"
                  value={formData.swiftCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, swiftCode: e.target.value.toUpperCase() }))}
                  placeholder="8 or 11 character code"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm border-b pb-2">Account Settings</h4>
            
            <div>
              <Label htmlFor="description" className="text-sm">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this account's purpose"
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Primary Account</Label>
                <p className="text-xs text-muted-foreground">
                  Set as the main account for fee payments
                </p>
              </div>
              <Switch
                checked={formData.isPrimary}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrimary: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Account available for payments
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          {/* Preview */}
          {formData.bankName && formData.accountName && formData.accountNumber && (
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Bank:</strong> {formData.bankName}</div>
                  <div><strong>Account:</strong> {formData.accountName}</div>
                  <div><strong>Number:</strong> {formatAccountNumber(formData.accountNumber)}</div>
                  <div className="flex gap-2 mt-2">
                    {formData.isPrimary && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Primary</Badge>
                    )}
                    <Badge className={formData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} >
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Primary Account Warning */}
          {formData.isPrimary && existingAccounts.some(acc => acc.isPrimary && acc.isActive) && !editingAccount && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Setting this as primary will deactivate the current primary account.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Add Account'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}