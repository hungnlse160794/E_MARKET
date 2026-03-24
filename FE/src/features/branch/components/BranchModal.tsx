import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin, Phone, Clock, Loader2 } from "lucide-react"
import { Modal } from "@/components/premium/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { branchSchema, type BranchInput } from "@/schemas/branchSchema"
import { MotionWrapper, StaggerContainer } from "@/components/premium/MotionWrapper"
import type { IBranch } from "@/types"
import { useEffect } from "react"
import LocationMap from "./LocationMap"
import { useReverseGeocode } from "../hooks/useGeocoding"


interface BranchModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: IBranch | null
  onSubmit: (data: BranchInput) => void
  isSubmitting?: boolean
  isLoading?: boolean
}

export function BranchModal({ isOpen, onClose, initialData, onSubmit, isSubmitting, isLoading }: BranchModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      branchName: '',
      address: {
        province: '',
        district: '',
        ward: '',
        street: '',
        fullAddress: '',
      },
      location: {
        type: 'Point',
        coordinates: [105.85, 21.01]
      },
      contactPhone: '',
      workingHours: {
         open: '08:00',
         close: '22:00'
      },
    }
  });

  const lat = watch("location.coordinates.1");
  const lon = watch("location.coordinates.0");
  const { data: geoAddress, isFetching: isGeocoding } = useReverseGeocode(lat, lon);

  // Auto-fill address fields when geocoding result arrives
  useEffect(() => {
    if (geoAddress) {
      if (geoAddress.province) setValue("address.province", geoAddress.province, { shouldValidate: true });
      if (geoAddress.district) setValue("address.district", geoAddress.district, { shouldValidate: true });
      if (geoAddress.ward) setValue("address.ward", geoAddress.ward, { shouldValidate: true });
      if (geoAddress.street) setValue("address.street", geoAddress.street, { shouldValidate: true });
      if (geoAddress.fullAddress) setValue("address.fullAddress", geoAddress.fullAddress, { shouldValidate: true });
    }
  }, [geoAddress, setValue]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          branchName: initialData.branchName,
          address: {
            province: initialData.address.province || '',
            district: initialData.address.district || '',
            ward: initialData.address.ward || '',
            street: initialData.address.street || '',
            fullAddress: initialData.address.fullAddress,
          },
          location: {
            type: 'Point',
            coordinates: initialData.location.coordinates
          },
          contactPhone: initialData.contactPhone || '',
          workingHours: {
             open: initialData.workingHours?.open || '08:00',
             close: initialData.workingHours?.close || '22:00'
          },
        });
      } else {
        reset({
          branchName: '',
          address: {
            province: '',
            district: '',
            ward: '',
            street: '',
            fullAddress: '',
          },
          location: {
            type: 'Point',
            coordinates: [105.85, 21.01]
          },
          contactPhone: '',
          workingHours: {
             open: '08:00',
             close: '22:00'
          },
        });
      }
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit: SubmitHandler<BranchInput> = (data) => {
    onSubmit(data);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "CẬP NHẬT CHI NHÁNH" : "THÊM CHI NHÁNH MỚI"}
             maxWidth="max-w-[800px]"
    >
      {isLoading ? (
        <div className="space-y-8 p-10">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-2xl" />
          <div className="flex gap-4">
             <Skeleton className="h-14 flex-1 rounded-xl" />
             <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10">
        
        <StaggerContainer staggerDelay={0.03}>
          <div className="space-y-8">
            <div className="flex items-center gap-4 py-3 border-b border-slate-50">
               <div className="h-1.5 w-6 bg-teal-500 rounded-full" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Thông tin cơ bản</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Tên chi nhánh</Label>
                <Input 
                   placeholder="VD: Chi nhánh Kim Mã" 
                   {...register("branchName")}
                   className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-sm focus:ring-teal-500/20"
                />
                {errors.branchName && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.branchName.message}</p>}
              </MotionWrapper>

              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Số điện thoại liên hệ</Label>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                      <Phone size={18} />
                   </div>
                   <Input 
                      placeholder="VD: 0987654321" 
                      {...register("contactPhone")}
                      className="h-14 pl-14 bg-slate-50 border-slate-100 rounded-2xl pr-6 font-bold text-sm focus:ring-teal-500/20"
                   />
                </div>
                {errors.contactPhone && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.contactPhone.message}</p>}
              </MotionWrapper>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-50">
               <div className="flex items-center gap-4">
                  <div className="h-1.5 w-6 bg-teal-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Địa chỉ & Vị trí</span>
               </div>
               {isGeocoding && (
                 <div className="flex items-center gap-2 animate-in fade-in duration-300">
                    <Loader2 size={12} className="animate-spin text-teal-500" />
                    <span className="text-[9px] font-bold text-teal-600 uppercase tracking-tighter italic">Đang lấy địa chỉ...</span>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-600 tracking-tight pl-1">Tỉnh/Thành</Label>
                  <Input {...register("address.province")} className="h-11 bg-slate-50 border-slate-100 rounded-xl text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-600 tracking-tight pl-1">Quận/Huyện</Label>
                  <Input {...register("address.district")} className="h-11 bg-slate-50 border-slate-100 rounded-xl text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-600 tracking-tight pl-1">Phường/Xã</Label>
                  <Input {...register("address.ward")} className="h-11 bg-slate-50 border-slate-100 rounded-xl text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-600 tracking-tight pl-1">Đường</Label>
                  <Input {...register("address.street")} className="h-11 bg-slate-50 border-slate-100 rounded-xl text-xs font-bold" />
                </div>
              </div>

              <MotionWrapper variant="staggerItem" className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Địa chỉ đầy đủ</Label>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                      <MapPin size={18} />
                   </div>
                   <Input 
                      placeholder="VD: 123 Kim Mã, Ba Đình, Hà Nội" 
                      {...register("address.fullAddress")}
                      className="h-14 pl-14 bg-slate-50 border-slate-100 rounded-2xl pr-6 font-bold text-sm focus:ring-teal-500/20"
                   />
                </div>
                {errors.address?.fullAddress && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.address.fullAddress.message}</p>}
              </MotionWrapper>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Kinh độ (Longitude)</Label>
                  <Input 
                    type="number"
                    step="any"
                    {...register("location.coordinates.0", { valueAsNumber: true })}
                    className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold tabular-nums shadow-inner text-sm text-slate-800"
                  />
                  {errors.location?.coordinates?.[0] && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.location.coordinates[0].message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-600 tracking-widest pl-1">Vĩ độ (Latitude)</Label>
                  <Input 
                    type="number"
                    step="any"
                    {...register("location.coordinates.1", { valueAsNumber: true })}
                    className="h-12 bg-slate-50 border-slate-100 rounded-xl px-4 font-bold tabular-nums shadow-inner text-sm text-slate-800"
                  />
                  {errors.location?.coordinates?.[1] && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-1">{errors.location.coordinates[1].message}</p>}
                </div>
              </div>

              {/* Map Picker UI */}
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase text-slate-800 tracking-widest pl-1">Chọn vị trí trên bản đồ</Label>
                 <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                    <LocationMap 
                      isPicker
                      initialCenter={[
                        watch("location.coordinates.1") || 21.0285, 
                        watch("location.coordinates.0") || 105.8542
                      ]}
                      onLocationSelect={(newCoords) => {
                        setValue("location.coordinates.1", Number(newCoords[0].toFixed(7))); // Lat
                        setValue("location.coordinates.0", Number(newCoords[1].toFixed(7))); // Lng
                      }}
                      className="h-[300px] w-full"
                    />
                 </div>
                 <p className="text-[10px] text-slate-400 italic">Nhấp chuột vào bản đồ để ghim tọa độ chính xác của chi nhánh</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-6">
                  <div className="flex items-center gap-4 py-3 border-b border-slate-50">
                    <div className="h-1.5 w-6 bg-teal-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Giờ hoạt động</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-slate-600 tracking-tighter flex items-center gap-2">
                          Mở cửa <Clock size={10} />
                       </Label>
                       <Input type="time" {...register("workingHours.open")} className="h-11 bg-white border-slate-100 rounded-xl font-bold text-sm text-slate-800" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[9px] font-bold uppercase text-slate-600 tracking-tighter flex items-center gap-2">
                          Đóng cửa <Clock size={10} />
                       </Label>
                       <Input type="time" {...register("workingHours.close")} className="h-11 bg-white border-slate-100 rounded-xl font-bold text-sm text-slate-800" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </StaggerContainer>

        <div className="pt-8 border-t border-slate-50 flex gap-4">
           <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-14 flex-1 rounded-2xl border-slate-100 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
           >
              HỦY BỎ
           </Button>
           <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-14 flex-1 rounded-2xl bg-teal-600 text-white font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-teal-700 shadow-lg shadow-teal-100/50 transition-all disabled:opacity-50"
           >
              {isSubmitting ? "ĐANG XỬ LÝ..." : (initialData ? "CẬP NHẬT" : "THÊM CHI NHÁNH")}
           </Button>
        </div>
        
        </form>
      )}
    </Modal>
  )
}
