"use client";

const SIRAJGANJ_UPAZILAS = ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullapara"];

type Props = { value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string; className?: string };

export default function SirajganjUpazilaInput({ value, onChange, required = false, placeholder = "Select an upazila", className }: Props) {
  return <><input required={required} list="sirajganj-upazilas" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} /><datalist id="sirajganj-upazilas">{SIRAJGANJ_UPAZILAS.map((upazila) => <option key={upazila} value={upazila} />)}</datalist></>;
}
