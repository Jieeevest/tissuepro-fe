// Static fallback data for Landing page — used when API is unavailable.

export type LandingProduct = {
  id?: string
  name: string
  nanoparticles: string
  type: string
  description: string
  price?: number | null
}

export type LandingArea = {
  name: string
  specialty: string
  description: string
}

export type LandingCaseStudy = {
  specialty: string
  title: string
  description: string
  coverImage: string
  metrics: { label: string; value: string }[]
}

export type LandingPipelineItem = {
  product: string
  platform: string
  stage: string
}

export const STATIC_STAINING_PRODUCTS: LandingProduct[] = [
  {
    name: "AFS Premium",
    nanoparticles: "100ml / 500ml / 1000ml",
    type: "Amniotic Fluid Substitute — Tissue Preservation",
    description: "Superior tissue preservation solution that maintains structural integrity better than standard PBS. Ideal for long-term specimen storage and processing.",
  },
  {
    name: "H&E Complete",
    nanoparticles: "Kit — 500ml Each",
    type: "Hematoxylin & Eosin — Ready-to-Use",
    description: "Combined H&E staining solution for optimal nuclear and cytoplasmic contrast. Consistent, vibrant results in every application.",
  },
  {
    name: "CV Staining Set",
    nanoparticles: "100ml / 500ml",
    type: "Cresyl Violet — Special Staining",
    description: "High-performance cresyl violet for Nissl substance visualization. Essential for neural tissue histochemistry and neuropathology research.",
  },
]

export const STATIC_BUFFER_PRODUCTS: LandingProduct[] = [
  {
    name: "PBS 1x Standard",
    nanoparticles: "500ml / 1000ml",
    type: "Phosphate Buffered Saline",
    description: "Standard isotonic buffer for tissue washing, dilution, and cell culture applications. Endotoxin-tested and sterile-filtered.",
  },
  {
    name: "PBS 10x Concentrate",
    nanoparticles: "500ml / 1000ml",
    type: "Phosphate Buffered Saline — Concentrated",
    description: "High-concentration PBS for labs requiring custom dilutions. Economical option for high-volume laboratory users.",
  },
]

export const STATIC_AREAS: LandingArea[] = [
  { name: "Histology",           specialty: "Tissue Pathology",         description: "Standard staining procedures for tissue section preparation and morphological analysis in diagnostic and research pathology." },
  { name: "Neuropathology",      specialty: "Neuroscience Research",    description: "Specialized staining for neural tissue characterization, Nissl body visualization, and neurodegenerative disease studies." },
  { name: "Dermatopathology",    specialty: "Dermatology Research",     description: "Skin tissue processing and staining for dermatological diagnosis and cutaneous pathology research applications." },
  { name: "Oncology Research",   specialty: "Cancer Biology",           description: "Tumor tissue processing and staining for cancer biomarker analysis, histological grading, and pathological staging." },
  { name: "Pharmaceutical R&D",  specialty: "Drug Development",         description: "Tissue analysis for drug efficacy and toxicology studies in pharmaceutical research and development pipelines." },
  { name: "Academic Research",   specialty: "University Laboratories",  description: "High-quality reagents for teaching, training, and investigative research in academic and university settings." },
  { name: "Clinical Pathology",  specialty: "Hospital Laboratories",    description: "Reliable staining solutions for routine clinical pathology diagnostics and patient tissue analysis workflows." },
  { name: "Biomedical Research", specialty: "Translational Science",    description: "Supporting translational research from bench to bedside with consistent, validated laboratory reagents." },
]

export const STATIC_CASE_STUDIES: LandingCaseStudy[] = [
  {
    specialty: "Neuropathology",
    title: "Nissl Staining with CV Staining Set",
    description: "Evaluation of CV staining kit performance in hippocampal section preparation for neural tissue analysis.",
    coverImage: "https://picsum.photos/seed/tissuepro-neuro/480/560",
    metrics: [
      { label: "Staining clarity — sharp nuclear definition achieved", value: "Excellent" },
      { label: "Protocol preparation time from start to finish", value: "< 30 min" },
    ],
  },
  {
    specialty: "Oncology Research",
    title: "H&E Staining in Breast Tumor Sections",
    description: "H&E Complete Kit performance evaluation for breast tumor tissue characterization and histological grading.",
    coverImage: "https://picsum.photos/seed/tissuepro-onco/480/560",
    metrics: [
      { label: "Nuclear-cytoplasmic contrast quality", value: "Excellent" },
      { label: "Batch-to-batch reproducibility", value: "Consistent" },
    ],
  },
  {
    specialty: "Tissue Preservation",
    title: "AFS vs PBS Long-Term Preservation Study",
    description: "Comparative study evaluating tissue morphology retention at 6 months using AFS Premium versus standard PBS.",
    coverImage: "https://picsum.photos/seed/tissuepro-pres/480/560",
    metrics: [
      { label: "Tissue morphology retention at 6 months", value: "Superior in AFS" },
      { label: "Structural integrity score", value: "Excellent" },
    ],
  },
  {
    specialty: "Dermatopathology",
    title: "Skin Biopsy Processing with H&E Complete",
    description: "Performance evaluation of H&E Complete Kit in routine skin biopsy processing for dermatopathology diagnostics.",
    coverImage: "https://picsum.photos/seed/tissuepro-derm/480/560",
    metrics: [
      { label: "Diagnostic clarity for pathologist review", value: "High" },
      { label: "Turnaround time reduction vs. prior reagent", value: "20%" },
    ],
  },
]

export const STATIC_PIPELINE: LandingPipelineItem[] = [
  { product: "AFS Enhanced",    platform: "Tissue Preservation Platform",  stage: "research"        },
  { product: "NeuroStain Pro",  platform: "Neuroscience Platform",         stage: "pre-clinical"    },
  { product: "MultiStain Kit",  platform: "Multiplex Staining Platform",   stage: "early-research"  },
  { product: "PBS Ultra-Pure",  platform: "Buffer Solutions Platform",     stage: "research"        },
]

export const STAGE_STYLE: Record<string, string> = {
  "pre-clinical":  "text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
  research:        "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  "special-order": "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  "early-research":"text-slate-500 dark:text-slate-400 bg-black/[0.04] dark:bg-slate-500/10 border-black/[0.08] dark:border-slate-500/20",
}

export const STAGE_LABELS: Record<string, string> = {
  "pre-clinical":  "Pre-Clinical",
  research:        "Research",
  "special-order": "Special Order",
  "early-research":"Early Research",
}

export const WA_NUMBER = "6281234567890"
export const WA_DEFAULT = "Halo TissuePro Tech ID, saya ingin menanyakan produk laboratorium untuk institusi saya."
