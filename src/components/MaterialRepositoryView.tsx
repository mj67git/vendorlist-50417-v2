import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, X, Upload, Download, ArrowUpDown, FileText, Database, Layers, RefreshCw, Pill, FlaskConical, Droplet, Beaker, Archive } from 'lucide-react';
import { Material, MaterialRole, Pharmacopoeia, User, Vendor } from '../types';
import { Pagination } from './Pagination';

interface Props {
  materials: Material[];
  onAddMaterial: (material: Material) => void;
  onEditMaterial: (material: Material, customAction?: string) => void;
  onDeleteMaterial: (id: string) => void;
  currentUser: User | null;
  db?: Vendor[];
}

const roleOptions: { value: MaterialRole; label: string; code: string }[] = [
  { value: 'API', label: 'ماده موثره', code: 'API' },
  { value: 'Intermediate', label: 'حدواسط', code: 'INT' },
  { value: 'Excipient', label: 'ماده جانبی', code: 'EXP' },
  { value: 'Solvent', label: 'حلال', code: 'SOL' },
  { value: 'Reagent / Reactant', label: 'واکنشگر', code: 'REA' },
];

const pharmacopoeiaOptions: Pharmacopoeia[] = ['USP', 'EP', 'BP', 'JP', 'In-house'];

type SortField = 'nameFa' | 'nameEn' | 'role' | 'finalProduct' | 'cas' | 'pharmacopoeia';
type SortOrder = 'asc' | 'desc';

export const MaterialRepositoryView: React.FC<Props> = ({
  materials,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  currentUser,
  db = []
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<MaterialRole | 'All'>('All');
  const [pharmFilter, setPharmFilter] = useState<Pharmacopoeia | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('nameFa');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Custom Deletion States (prevents iframe blocking from window.confirm)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [specToDelete, setSpecToDelete] = useState<boolean>(false);

  // Computed connected vendors for data integrity validation
  const connectedVendors = useMemo(() => {
    if (!materialToDelete) return [];
    return db.filter(v => v.materialId === materialToDelete.id);
  }, [materialToDelete, db]);

  // Form State
  const [formData, setFormData] = useState<Partial<Material>>({
    nameFa: '',
    nameEn: '',
    iupac: '',
    cas: '',
    role: 'API',
    finalProduct: '',
    finalProductEn: '',
    pharmacopoeia: 'USP',
  });

  const getRoleInfo = (role?: MaterialRole) => {
    return roleOptions.find(r => r.value === role) || roleOptions[0];
  };

  const generateStandardNameFa = (data: Partial<Material>) => {
    const roleInfo = getRoleInfo(data.role as MaterialRole);
    const nameFaStr = data.nameFa?.trim() || '---';
    const finalProductStr = data.finalProduct?.trim() || '---';
    return `${roleInfo.label} - ${nameFaStr} (برای ${finalProductStr})`;
  };

  const generateStandardNameEn = (data: Partial<Material>) => {
    const roleInfo = getRoleInfo(data.role as MaterialRole);
    const nameEnStr = data.nameEn?.trim() || '---';
    const finalProductEnStr = data.finalProductEn?.trim() || data.finalProduct?.trim() || '---';
    return `${roleInfo.code}-${nameEnStr} (For ${finalProductEnStr})`;
  };

  const handleOpenAdd = () => {
    setFormData({
      nameFa: '',
      nameEn: '',
      iupac: '',
      cas: '',
      role: 'API',
      finalProduct: '',
      finalProductEn: '',
      pharmacopoeia: 'USP',
    });
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setFormData({
      id: material.id,
      nameFa: material.nameFa || '',
      nameEn: material.nameEn || '',
      iupac: material.iupac || '',
      cas: material.cas || '',
      role: material.role || 'API',
      finalProduct: material.finalProduct || '',
      finalProductEn: material.finalProductEn || '',
      pharmacopoeia: material.pharmacopoeia || 'USP',
      specificationFile: material.specificationFile || undefined,
    });
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleOpenView = (material: Material) => {
    setSelectedMaterial(material);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.nameFa || !formData.nameEn || !formData.cas || !formData.role || !formData.finalProduct || !formData.finalProductEn || !formData.pharmacopoeia) {
      alert("لطفاً فیلدهای الزامی را پر کنید.");
      return;
    }

    const isCasDuplicate = materials.some(m => m.cas === formData.cas && m.id !== editingMaterial?.id);
    if (isCasDuplicate && formData.cas.trim() !== '' && formData.cas.trim().toLowerCase() !== 'n/a') {
      alert("این CAS Number قبلاً ثبت شده است.");
      return;
    }

    const isComboDuplicate = materials.some(m => 
      m.role === formData.role && 
      m.nameEn.toLowerCase() === formData.nameEn?.toLowerCase() && 
      m.finalProductEn?.toLowerCase() === formData.finalProductEn?.toLowerCase() &&
      m.id !== editingMaterial?.id
    );
    if (isComboDuplicate) {
      alert("این ترکیب (Role + نام لاتین + محصول نهایی) قبلاً ثبت شده است.");
      return;
    }

    const newMaterial: Material = {
      id: editingMaterial ? editingMaterial.id : `mat_${Date.now()}`,
      nameFa: formData.nameFa,
      nameEn: formData.nameEn,
      iupac: formData.iupac,
      cas: formData.cas,
      role: formData.role as MaterialRole,
      finalProduct: formData.finalProduct,
      finalProductEn: formData.finalProductEn,
      pharmacopoeia: formData.pharmacopoeia as Pharmacopoeia,
      specificationFile: formData.specificationFile,
      standardNameFa: generateStandardNameFa(formData),
      standardNameEn: generateStandardNameEn(formData),
      createdAt: editingMaterial ? editingMaterial.createdAt : new Date().toISOString(),
    };

    if (editingMaterial) {
      onEditMaterial(newMaterial);
    } else {
      onAddMaterial(newMaterial);
    }
    setIsModalOpen(false);
  };

  const handleDeleteSpec = () => {
    if (selectedMaterial) {
      setSpecToDelete(true);
    }
  };

  const handleReplaceSpec = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedMaterial && e.target.files && e.target.files[0]) {
      const isReplacement = !!selectedMaterial.specificationFile;
      const updated = { ...selectedMaterial, specificationFile: e.target.files[0].name };
      onEditMaterial(updated, isReplacement ? 'Replace Specification' : 'Upload Specification');
      setSelectedMaterial(updated);
    }
  };

  const filteredMaterials = useMemo(() => {
    let result = materials;

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(m => 
        m.nameFa.toLowerCase().includes(lowerSearch) ||
        m.nameEn.toLowerCase().includes(lowerSearch) ||
        m.cas.toLowerCase().includes(lowerSearch) ||
        m.finalProduct.toLowerCase().includes(lowerSearch)
      );
    }

    if (roleFilter !== 'All') {
      result = result.filter(m => m.role === roleFilter);
    }

    if (pharmFilter !== 'All') {
      result = result.filter(m => m.pharmacopoeia === pharmFilter);
    }

    result.sort((a, b) => {
      let aVal = String(a[sortField]).toLowerCase();
      let bVal = String(b[sortField]).toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [materials, search, roleFilter, pharmFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const currentData = filteredMaterials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (material: Material) => {
    setMaterialToDelete(material);
  };

  const handleConfirmDeleteSpec = () => {
    if (selectedMaterial) {
      const updated = { ...selectedMaterial, specificationFile: undefined };
      onEditMaterial(updated, 'Delete Specification');
      setSelectedMaterial(updated);
      setSpecToDelete(false);
    }
  };

  const statTotal = materials.length;
  const statAPI = materials.filter(m => m.role === 'API').length;
  const statInt = materials.filter(m => m.role === 'Intermediate').length;
  const statExc = materials.filter(m => m.role === 'Excipient').length;
  const statSol = materials.filter(m => m.role === 'Solvent').length;
  const statRea = materials.filter(m => m.role === 'Reagent / Reactant').length;

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total</div>
            <div className="text-xl font-black text-slate-800 font-mono mt-0.5">{statTotal}</div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">API</div>
            <div className="text-xl font-black text-slate-800 font-mono mt-0.5">{statAPI}</div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Intermediate</div>
            <div className="text-xl font-black text-slate-800 font-mono mt-0.5">{statInt}</div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Excipient</div>
            <div className="text-xl font-black text-slate-800 font-mono mt-0.5">{statExc}</div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Solvent</div>
            <div className="text-xl font-black text-slate-800 font-mono mt-0.5">{statSol}</div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Beaker className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Reagent</div>
            <div className="text-xl font-black text-slate-800 font-mono mt-0.5">{statRea}</div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">مخزن مواد اولیه (Material Repository)</h1>
          <p className="text-sm text-slate-500 mt-1">مدیریت و ثبت اطلاعات پایه مواد اولیه</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="جستجو (نام، CAS، محصول)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 w-full sm:w-32"
            >
              <option value="All">همه Roleها</option>
              {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.value}</option>)}
            </select>
            
            <select 
              value={pharmFilter} 
              onChange={e => setPharmFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 w-full sm:w-40"
            >
              <option value="All">همه فارماکوپه‌ها</option>
              {pharmacopoeiaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن ماده جدید</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('nameFa')}>
                  <div className="flex items-center gap-1">
                    نام فارسی <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('nameEn')}>
                  <div className="flex items-center gap-1">
                    نام لاتین <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('role')}>
                  <div className="flex items-center justify-center gap-1">
                    Role <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('finalProduct')}>
                  <div className="flex items-center gap-1">
                    محصول نهایی <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('cas')}>
                  <div className="flex items-center justify-center gap-1">
                    CAS Number <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold text-center cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('pharmacopoeia')}>
                  <div className="flex items-center justify-center gap-1">
                    Pharmacopoeia <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.length > 0 ? (
                currentData.map(material => (
                  <tr key={material.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{material.nameFa}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600" dir="ltr">{material.nameEn}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-mono font-bold text-slate-600">
                        {material.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{material.finalProduct}</td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-600">{material.cas}</td>
                    <td className="py-3 px-4 text-center font-bold text-xs text-slate-600">{material.pharmacopoeia}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenView(material)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="مشاهده">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenEdit(material)} className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors" title="ویرایش">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button onClick={() => handleDelete(material)} className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">هیچ ماده‌ای یافت نشد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="px-6 pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredMaterials.length}
            startIndex={(currentPage - 1) * itemsPerPage}
            endIndex={currentPage * itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
          isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div onClick={() => setIsModalOpen(false)} className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ${isModalOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">
              {editingMaterial ? 'ویرایش ماده اولیه' : 'افزودن ماده اولیه جدید'}
            </h2>
            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">نام فارسی <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.nameFa || ''} 
                  onChange={e => setFormData({ ...formData, nameFa: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all"
                  placeholder="مثال: دی فنیل استون"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">نام لاتین <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.nameEn || ''} 
                  onChange={e => setFormData({ ...formData, nameEn: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                  placeholder="e.g. Diphenyl Acetone"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">نام IUPAC (اختیاری)</label>
                <input 
                  type="text" 
                  value={formData.iupac || ''} 
                  onChange={e => setFormData({ ...formData, iupac: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">CAS Number <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.cas || ''} 
                  onChange={e => setFormData({ ...formData, cas: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                  placeholder="123-45-6"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Role <span className="text-rose-500">*</span></label>
                <select 
                  value={formData.role || 'API'} 
                  onChange={e => setFormData({ ...formData, role: e.target.value as MaterialRole })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                >
                  {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.value} - {opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pharmacopoeia <span className="text-rose-500">*</span></label>
                <select 
                  value={formData.pharmacopoeia || 'USP'} 
                  onChange={e => setFormData({ ...formData, pharmacopoeia: e.target.value as Pharmacopoeia })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                >
                  {pharmacopoeiaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">محصول نهایی (فارسی) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.finalProduct || ''} 
                  onChange={e => setFormData({ ...formData, finalProduct: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all"
                  placeholder="نام محصول نهایی (فارسی)"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">محصول نهایی (لاتین) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.finalProductEn || ''} 
                  onChange={e => setFormData({ ...formData, finalProductEn: e.target.value })} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:bg-white transition-all font-mono"
                  placeholder="Final Product (Latin)"
                  dir="ltr"
                />
              </div>
              
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Specification File (اختیاری)</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm cursor-pointer hover:bg-slate-100 transition-colors text-slate-500">
                    <Upload className="w-4 h-4" />
                    <span>انتخاب فایل</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setFormData({ ...formData, specificationFile: e.target.files[0].name });
                        }
                      }}
                    />
                  </label>
                  {formData.specificationFile && (
                    <div className="flex items-center gap-2 bg-fuchsia-50 text-fuchsia-700 px-3 py-1.5 rounded-lg border border-fuchsia-100">
                      <FileText className="w-4 h-4" />
                      <span className="text-[11px] font-mono font-bold truncate max-w-[200px]" dir="ltr">
                        {formData.specificationFile}
                      </span>
                      <button type="button" onClick={() => setFormData({...formData, specificationFile: undefined})} className="text-rose-500 hover:text-rose-700 p-1">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">نام استاندارد فارسی (تولید خودکار)</label>
                <div className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-bold select-all">
                  {generateStandardNameFa(formData)}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Standard English Name (Auto-generated)</label>
                <div className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-mono font-bold select-all" dir="ltr">
                  {generateStandardNameEn(formData)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
            >
              انصراف
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 text-sm font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-xl shadow-sm transition-all active:scale-95"
            >
              ذخیره اطلاعات
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODAL (Redesigned) */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
          isViewModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div onClick={() => setIsViewModalOpen(false)} className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isViewModalOpen ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ${isViewModalOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">جزئیات ماده اولیه</h2>
            <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {selectedMaterial && (
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* بخش اول – اطلاعات پایه */}
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">بخش اول - اطلاعات پایه</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">نام فارسی</div>
                    <div className="text-sm font-bold text-slate-800">{selectedMaterial.nameFa}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">نام لاتین</div>
                    <div className="text-sm font-bold font-mono text-slate-800" dir="ltr">{selectedMaterial.nameEn}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">نام IUPAC</div>
                    <div className="text-sm font-mono text-slate-700" dir="ltr">{selectedMaterial.iupac || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CAS Number</div>
                    <div className="text-sm font-bold font-mono text-slate-800" dir="ltr">{selectedMaterial.cas}</div>
                  </div>
                </div>
              </section>

              {/* بخش دوم – اطلاعات طبقه‌بندی */}
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">بخش دوم - اطلاعات طبقه‌بندی</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role</div>
                    <div className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono font-bold text-slate-700">
                      {selectedMaterial.role}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pharmacopoeia</div>
                    <div className="text-sm font-bold font-mono text-slate-800">{selectedMaterial.pharmacopoeia}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">محصول نهایی (فارسی)</div>
                    <div className="text-sm font-bold text-slate-800">{selectedMaterial.finalProduct}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">محصول نهایی (لاتین)</div>
                    <div className="text-sm font-bold font-mono text-slate-800" dir="ltr">{selectedMaterial.finalProductEn}</div>
                  </div>
                </div>
              </section>

              {/* بخش سوم – اطلاعات استاندارد */}
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">بخش سوم - اطلاعات استاندارد</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">نام استاندارد فارسی</div>
                      <div className="text-sm font-bold text-slate-800">{selectedMaterial.standardNameFa}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Standard English Name</div>
                      <div className="text-sm font-bold font-mono text-slate-800" dir="ltr">{selectedMaterial.standardNameEn}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">فایل Specification</div>
                    {selectedMaterial.specificationFile ? (
                      <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="font-mono text-sm font-bold text-slate-700 truncate max-w-[200px] sm:max-w-[300px]" dir="ltr">
                            {selectedMaterial.specificationFile}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="دانلود">
                            <Download className="w-4 h-4" />
                          </button>
                          <label className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" title="جایگزینی">
                            <Upload className="w-4 h-4" />
                            <input type="file" className="hidden" onChange={handleReplaceSpec} />
                          </label>
                          <button onClick={handleDeleteSpec} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                        <div className="text-sm font-bold text-slate-400 font-mono mb-2">No Specification Uploaded</div>
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                          <Upload className="w-4 h-4" />
                          <span>آپلود فایل جدید</span>
                          <input type="file" className="hidden" onChange={handleReplaceSpec} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </section>

            </div>
          )}
        </div>
      </div>

      {/* CUSTOM MATERIAL DELETE MODAL */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          materialToDelete ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div onClick={() => setMaterialToDelete(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 transform scale-100">
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">حذف ماده اولیه</h3>
          </div>

          {materialToDelete && (
            <div className="space-y-4">
              {connectedVendors.length > 0 ? (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm leading-relaxed">
                    <strong>خطای یکپارچگی داده‌ها (ALCOA+):</strong> امکان حذف این ماده به علت وجود وابستگی در سورس‌های فعال وجود ندارد. ابتدا باید وابستگی سورس‌های زیر را برطرف نمایید:
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl p-2 bg-slate-50">
                    {connectedVendors.map(vendor => (
                      <div key={vendor.id} className="py-2 px-1 text-xs text-slate-700 flex justify-between items-center">
                        <span className="font-bold">{vendor.name}</span>
                        <span className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
                          {vendor.category === 'sample' ? 'نمونه' : vendor.category}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => setMaterialToDelete(null)} 
                      className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                    >
                      متوجه شدم
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    آیا از حذف ماده اولیه <span className="font-black text-slate-800">«{materialToDelete.nameFa}» ({materialToDelete.nameEn})</span> اطمینان دارید؟ 
                    این عمل غیرقابل بازگشت بوده و تمامی اطلاعات مربوط به این ماده از سیستم حذف خواهد شد.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setMaterialToDelete(null)} 
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                    >
                      انصراف
                    </button>
                    <button 
                      onClick={() => {
                        onDeleteMaterial(materialToDelete.id);
                        setMaterialToDelete(null);
                      }} 
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-600/20"
                    >
                      تایید و حذف نهایی
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM SPEC FILE DELETE MODAL */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          specToDelete ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div onClick={() => setSpecToDelete(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
        
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transition-all duration-300 transform scale-100">
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">حذف فایل پیوست Specification</h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              آیا از حذف فایل پیوست مشخصات فنی (Specification) این ماده اطمینان دارید؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button 
                onClick={() => setSpecToDelete(false)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
              >
                انصراف
              </button>
              <button 
                onClick={handleConfirmDeleteSpec} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-600/20"
              >
                تایید حذف فایل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
