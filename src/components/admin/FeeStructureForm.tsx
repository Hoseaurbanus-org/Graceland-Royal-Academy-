import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, Save, X } from 'lucide-react';
import { FEE_FORM_FIELDS } from './accountant-constants';
import { formatCurrency } from './accountant-utils';

interface FeeStructureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingFee: { className: string; term: string } | null;
  currentSession: string;
  feeFormData: Record<string, number>;
  setFeeFormData: (data: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
}

export function FeeStructureForm({
  isOpen,
  onClose,
  onSave,
  editingFee,
  currentSession,
  feeFormData,
  setFeeFormData
}: FeeStructureFormProps) {
  const handleFieldChange = (key: string, value: string) => {
    setFeeFormData(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const totalFee = Object.values(feeFormData).reduce((sum, val) => sum + val, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Edit Fee Structure - {editingFee?.className} ({editingFee?.term})
          </DialogTitle>
          <DialogDescription className="text-sm">
            Set the fee structure for {editingFee?.className} in {editingFee?.term} - {currentSession}
          </DialogDescription>
        </DialogHeader>
        
        {editingFee && (
          <div className="space-y-4 p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEE_FORM_FIELDS.map((field, index) => (
                <div key={field.key} className={index >= 5 ? 'sm:col-span-2' : ''}>
                  <Label htmlFor={field.key} className="text-sm">{field.label}</Label>
                  <Input
                    id={field.key}
                    type="number"
                    value={feeFormData[field.key]}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>

            {/* Total Display */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Fee:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalFee)}
                </span>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Fee changes will be immediately visible to all parents with children in {editingFee.className}.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button onClick={onSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Fee Structure
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}