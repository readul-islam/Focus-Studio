import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/userUser';
import { toast } from 'sonner';
import { Upload, Plus, X } from 'lucide-react';

interface Certification {
  id?: number;
  name: string;
  expiry_date: string;
  certificate_file?: string;
}

interface ProfileData {
  // Personal Details
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  // Company
  company_name: string;
  trade_specialty: string;

  // Insurance
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_expiry_date: string;
  insurance_certificate?: string;

  // Certifications
  certifications: Certification[];

  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
}

export default function Profile() {
  const { user } = useUser();

  // TODO: Replace with actual API endpoint when available
  const { data: profileData, isLoading, refetch } = useFetch(
    'contractor_portal/profile/',
    { enabled: true }
  );

  const [personalDetails, setPersonalDetails] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [companyDetails, setCompanyDetails] = useState({
    company_name: '',
    trade_specialty: '',
  });

  const [insuranceDetails, setInsuranceDetails] = useState({
    insurance_provider: '',
    insurance_policy_number: '',
    insurance_expiry_date: '',
    insurance_certificate: null as File | null,
  });

  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [emergencyContact, setEmergencyContact] = useState({
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    if (profileData) {
      setPersonalDetails({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
      });
      setCompanyDetails({
        company_name: profileData.company_name || '',
        trade_specialty: profileData.trade_specialty || '',
      });
      setInsuranceDetails({
        insurance_provider: profileData.insurance_provider || '',
        insurance_policy_number: profileData.insurance_policy_number || '',
        insurance_expiry_date: profileData.insurance_expiry_date || '',
        insurance_certificate: null,
      });
      setCertifications(profileData.certifications || []);
      setEmergencyContact({
        emergency_contact_name: profileData.emergency_contact_name || '',
        emergency_contact_relationship: profileData.emergency_contact_relationship || '',
        emergency_contact_phone: profileData.emergency_contact_phone || '',
      });
    }
  }, [profileData]);

  const updateMutation = usePost({
    onSuccess: () => {
      toast.success('Profile updated successfully');
      refetch();
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const handleSavePersonalDetails = () => {
    updateMutation.mutate({
      url: 'contractor_portal/profile/',
      data: personalDetails,
      method: 'PATCH',
    });
  };

  const handleSaveCompany = () => {
    updateMutation.mutate({
      url: 'contractor_portal/profile/',
      data: companyDetails,
      method: 'PATCH',
    });
  };

  const handleSaveInsurance = () => {
    const formData = new FormData();
    Object.entries(insuranceDetails).forEach(([key, value]) => {
      if (value && key !== 'insurance_certificate') {
        formData.append(key, value);
      }
    });
    if (insuranceDetails.insurance_certificate) {
      formData.append('insurance_certificate', insuranceDetails.insurance_certificate);
    }

    updateMutation.mutate({
      url: 'contractor_portal/profile/',
      data: formData,
      method: 'PATCH',
    });
  };

  const handleSaveCertifications = () => {
    updateMutation.mutate({
      url: 'contractor_portal/profile/',
      data: { certifications },
      method: 'PATCH',
    });
  };

  const handleSaveEmergencyContact = () => {
    updateMutation.mutate({
      url: 'contractor_portal/profile/',
      data: emergencyContact,
      method: 'PATCH',
    });
  };

  const addCertification = () => {
    setCertifications([...certifications, { name: '', expiry_date: '' }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Profile | TechStyles</title>
      </Helmet>

      <div className="max-w-7xl">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          {/* Personal Details */}
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Personal Details</h3>
          </div>
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name</Label>
                <Input id="first_name" value={personalDetails.first_name} onChange={(e) => setPersonalDetails({ ...personalDetails, first_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input id="last_name" value={personalDetails.last_name} onChange={(e) => setPersonalDetails({ ...personalDetails, last_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input id="email" type="email" value={personalDetails.email} onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                <Input id="phone" value={personalDetails.phone} onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Company */}
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
          </div>
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">Company Name</Label>
                <Input id="company_name" value={companyDetails.company_name} onChange={(e) => setCompanyDetails({ ...companyDetails, company_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="trade_specialty" className="text-sm font-medium text-gray-700">Trade/Specialty</Label>
                <Input id="trade_specialty" value={companyDetails.trade_specialty} onChange={(e) => setCompanyDetails({ ...companyDetails, trade_specialty: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Insurance</h3>
          </div>
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insurance_provider" className="text-sm font-medium text-gray-700">Provider Name</Label>
                <Input id="insurance_provider" value={insuranceDetails.insurance_provider} onChange={(e) => setInsuranceDetails({ ...insuranceDetails, insurance_provider: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="insurance_policy_number" className="text-sm font-medium text-gray-700">Policy Number</Label>
                <Input id="insurance_policy_number" value={insuranceDetails.insurance_policy_number} onChange={(e) => setInsuranceDetails({ ...insuranceDetails, insurance_policy_number: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="insurance_expiry_date" className="text-sm font-medium text-gray-700">Expiry Date</Label>
                <Input id="insurance_expiry_date" type="date" value={insuranceDetails.insurance_expiry_date} onChange={(e) => setInsuranceDetails({ ...insuranceDetails, insurance_expiry_date: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="insurance_certificate" className="text-sm font-medium text-gray-700">Upload Certificate</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input id="insurance_certificate" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setInsuranceDetails({ ...insuranceDetails, insurance_certificate: e.target.files?.[0] || null })} className="flex-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Certifications</h3>
            <Button onClick={addCertification} variant="outline" size="sm" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />Add
            </Button>
          </div>
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <div className="space-y-3">
              {certifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">No certifications added yet</p>
              ) : (
                certifications.map((cert, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border border-gray-200 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Certification Name</Label>
                      <Input value={cert.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} className="mt-1" placeholder="e.g., OSHA 30" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                      <Input type="date" value={cert.expiry_date} onChange={(e) => updateCertification(index, 'expiry_date', e.target.value)} className="mt-1" />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-700">Upload</Label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1" />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeCertification(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Emergency Contact</h3>
          </div>
          <div className="p-4 sm:p-5 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name" className="text-sm font-medium text-gray-700">Name</Label>
                <Input id="emergency_contact_name" value={emergencyContact.emergency_contact_name} onChange={(e) => setEmergencyContact({ ...emergencyContact, emergency_contact_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="emergency_contact_relationship" className="text-sm font-medium text-gray-700">Relationship</Label>
                <Input id="emergency_contact_relationship" value={emergencyContact.emergency_contact_relationship} onChange={(e) => setEmergencyContact({ ...emergencyContact, emergency_contact_relationship: e.target.value })} className="mt-1" placeholder="e.g., Spouse, Parent" />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone" className="text-sm font-medium text-gray-700">Phone</Label>
                <Input id="emergency_contact_phone" value={emergencyContact.emergency_contact_phone} onChange={(e) => setEmergencyContact({ ...emergencyContact, emergency_contact_phone: e.target.value })} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Single Save Button */}
          <div className="p-4 sm:p-5 flex justify-end">
            <Button
              onClick={() => {
                handleSavePersonalDetails();
                handleSaveCompany();
                handleSaveInsurance();
                handleSaveCertifications();
                handleSaveEmergencyContact();
              }}
              disabled={updateMutation.isPending}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              Save changes
            </Button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
