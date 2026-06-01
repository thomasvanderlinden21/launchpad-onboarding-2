import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { resetOnboardingProgress } from './onboardingProgress'

const EASE = [0.22, 1, 0.36, 1] as const
const COLLAPSE_DUR = 0.38
const LABEL_EXIT_DUR = 0.18  // labels slide-fade out
const LOGO_DUR = 0.2         // logo cross-fade

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21v-5h6v5" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function CreditCardIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="13" rx="2" stroke="white" strokeWidth={1.5} />
      <path d="M2 10h20" stroke="white" strokeWidth={1.5} />
    </svg>
  )
}
function StorefrontIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h16l1 5H3L4 5z" stroke="white" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M3 10h18v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9z" stroke="white" strokeWidth={1.5} />
      <path d="M9 21v-6h6v6" stroke="white" strokeWidth={1.5} />
    </svg>
  )
}
function SwapIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 16l-4-4 4-4M17 8l4 4-4 4" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12h18" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12.586 2H20a1 1 0 011 1v7.414a1 1 0 01-.293.707l-9.5 9.5a2 2 0 01-2.828 0l-5-5a2 2 0 010-2.828l9.5-9.5A1 1 0 0112.586 2z" stroke="white" strokeWidth={1.5} />
      <circle cx="16.5" cy="7.5" r="1" fill="white" />
    </svg>
  )
}
function ApartmentIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21V8l9-5 9 5v13H3z" stroke="white" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M9 21v-5h6v5" stroke="white" strokeWidth={1.5} />
      <rect x="9.5" y="9" width="5" height="4" rx=".5" stroke="white" strokeWidth={1.25} />
    </svg>
  )
}
function WrenchIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth={1.5} />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="white" strokeWidth={1.5} />
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function HelpIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="white" strokeWidth={1.5} />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="white" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="12" cy="17" r=".5" fill="white" stroke="white" strokeWidth={1} />
    </svg>
  )
}
function SparkleIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.74L4 10l5.91-1.74L12 2z" stroke="white" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" stroke="white" strokeWidth={1} strokeLinejoin="round" />
    </svg>
  )
}

// ─── Logos ────────────────────────────────────────────────────────────────────

function WorldlineLogo() {
  return (
    <svg width="139" height="14" viewBox="0 0 139 14" fill="none" aria-label="Worldline" style={{ flexShrink: 0 }}>
      <path d="M117.768 13.788C117.374 10.5301 116.282 7.51996 114.594 5.11998C114.151 4.4868 113.674 3.91234 113.173 3.39404C112.687 3.83063 112.233 4.30042 111.814 4.80339C113.849 6.89443 115.317 10.0884 115.811 13.788H117.768Z" fill="#E9EBEF"/>
      <path d="M114.105 13.7877C113.736 11.3399 112.886 9.08468 111.615 7.25842C111.34 6.86286 111.047 6.49299 110.745 6.15137C110.371 6.73957 110.039 7.3586 109.754 8.00588C110.911 9.50335 111.763 11.5094 112.152 13.7877H114.105Z" fill="#E9EBEF"/>
      <path d="M109.08 9.96973C108.772 11.1839 108.607 12.4652 108.607 13.7879H110.439C110.175 12.3903 109.716 11.0935 109.08 9.96973Z" fill="#E9EBEF"/>
      <path d="M125.228 13.7877C125.82 8.66695 128.014 5.21845 129.896 3.13768C130.052 2.96767 130.208 2.80273 130.363 2.64286C130.103 2.45509 129.833 2.27746 129.56 2.10745C129.435 2.23686 129.31 2.36881 129.19 2.5033C127.583 4.27449 125.766 6.9871 124.802 10.8035C124.506 9.26326 124.093 7.77628 123.565 6.36034C124.611 4.03343 125.909 2.23686 127.103 0.907196C126.782 0.787932 126.453 0.681356 126.121 0.584931C125.093 1.77249 124.014 3.28486 123.083 5.15755C122.412 3.60458 121.596 2.15312 120.647 0.838683C120.491 0.625531 120.335 0.414916 120.175 0.211914C119.44 0.323565 118.726 0.496117 118.034 0.716882C119.692 2.6251 121.042 5.04082 121.968 7.79911C121.626 8.77099 121.333 9.81391 121.101 10.9355C120.448 7.97674 119.277 5.26159 117.647 3.00319C117.228 2.42464 116.789 1.88668 116.33 1.39186C115.716 1.68622 115.124 2.02371 114.562 2.4018C117.182 5.03829 119.037 9.1034 119.562 13.7851H121.636C121.792 12.1992 122.075 10.7452 122.453 9.41805C122.82 10.8086 123.08 12.2702 123.223 13.7851H125.228V13.7877Z" fill="#E9EBEF"/>
      <path d="M128.565 13.7854C129.127 9.82916 130.851 7.14062 132.343 5.49386C132.446 5.38089 132.55 5.27044 132.653 5.16501C132.452 4.92151 132.242 4.68303 132.023 4.45459C129.921 6.5984 128.162 9.71118 127.615 13.7879H128.565V13.7854Z" fill="#E9EBEF"/>
      <path d="M132.243 13.7877C132.698 11.2752 133.72 9.43384 134.714 8.16343C134.572 7.8394 134.419 7.52309 134.254 7.21191C132.873 8.84492 131.742 11.036 131.279 13.7877H132.243Z" fill="#E9EBEF"/>
      <path d="M135.691 11.4546C135.381 12.1586 135.124 12.9373 134.943 13.7879H135.859C135.862 12.9933 135.804 12.2146 135.691 11.4546Z" fill="#E9EBEF"/>
      <path d="M49.6379 0.424316H46.7148V13.5758H54.7297V10.9836H49.6379V0.424316Z" fill="#E9EBEF"/>
      <path d="M71.1452 0.424316H70.0723V13.5758H77.1711V12.6133H71.1452V0.424316Z" fill="#E9EBEF"/>
      <path d="M79.4614 0.424316H78.3164V13.5758H79.4614V0.424316Z" fill="#E9EBEF"/>
      <path d="M96.5616 12.6133V7.30503H102.397V6.37109H96.5616V1.38685H102.827V0.424316H95.4902V13.5758H103.047V12.6133H96.5616Z" fill="#E9EBEF"/>
      <path d="M91.9192 12.6133H91.7011L84.1245 0.424316H82.209V13.5758H83.271V1.38685H83.5271L91.1037 13.5758H92.9718V0.424316H91.9192V12.6133Z" fill="#E9EBEF"/>
      <path d="M13.2693 10.9836H13.0513L10.8903 0.786458H7.83837L5.91432 10.9836H5.62998L3.00455 0.424316H0L3.22255 13.5758H7.72463L9.34539 5.56103L11.0894 13.5758H15.6862L18.5486 0.424316H15.5346L13.2693 10.9836Z" fill="#E9EBEF"/>
      <path d="M66.2405 2.19303C64.8517 0.794679 63.0284 0.202321 60.9405 0.212031H56.1035V13.7877H60.9405C62.1214 13.7877 63.1512 13.6032 64.0298 13.2244C65.6925 12.535 66.949 11.2337 67.5725 9.58291C67.9221 8.6701 68.0354 7.72816 68.0071 6.77651C68.0071 5.06741 67.4403 3.40687 66.2405 2.19303ZM64.6817 8.79634C64.3132 9.78684 63.6236 10.4957 62.6599 10.8744C62.1687 11.0687 61.6207 11.1561 60.9972 11.1561H59.0322V2.84365H60.9972C61.6207 2.84365 62.1687 2.93105 62.6599 3.09613C63.633 3.436 64.3132 4.13518 64.6817 5.11596C65.0501 6.15502 65.0595 7.74758 64.6817 8.79634Z" fill="#E9EBEF"/>
      <path d="M28.7169 0.590333C27.0229 -0.196778 24.251 -0.196778 22.557 0.590333C20.8727 1.32945 19.6118 2.67329 18.9958 4.3435C18.6397 5.2746 18.5242 6.21529 18.5531 7.18478C18.5723 9.71889 20.1027 12.2722 22.5089 13.3665C24.2125 14.2112 27.0807 14.2112 28.7843 13.3665C31.1905 12.2722 32.7209 9.71889 32.7401 7.18478C32.8171 5.37058 32.2011 3.518 30.9403 2.16455C30.3339 1.50223 29.6024 0.983888 28.7169 0.590333ZM25.6466 11.2931C23.1152 11.2931 21.6619 9.30614 21.6619 7.0024C21.6619 4.61227 23.0286 2.71169 25.6466 2.71169C27.8699 2.71169 29.6313 4.23792 29.6313 7.0024C29.6313 9.32534 28.149 11.2931 25.6466 11.2931Z" fill="#E9EBEF"/>
      <path d="M44.0117 7.3885C44.4995 6.69678 44.71 5.67842 44.6717 4.66005C44.6717 3.68012 44.4517 2.86351 44.0213 2.20061C42.9978 0.682669 41.209 0.231128 39.3055 0.211914H34.1211V13.5756H37.0864V9.47327C37.1438 9.47327 39.2673 9.47327 39.3342 9.47327L42.1369 13.5756H45.5708L42.2038 8.82959C42.9691 8.50294 43.5717 8.03219 44.0117 7.3885ZM41.3047 5.97624C40.9125 6.65835 40.2525 6.985 39.4394 6.985H37.0768V2.81547H39.449C39.8794 2.81547 40.2525 2.82508 40.5682 2.99801C40.8838 3.17094 41.1325 3.42072 41.3047 3.73776C41.6682 4.35262 41.6777 5.35177 41.3047 5.97624Z" fill="#E9EBEF"/>
    </svg>
  )
}

function WorldlineLogoIcon() {
  return (
    <svg width="24" height="12" viewBox="108 0 31 14" fill="none" aria-label="Worldline" style={{ flexShrink: 0 }}>
      <path d="M117.768 13.788C117.374 10.5301 116.282 7.51996 114.594 5.11998C114.151 4.4868 113.674 3.91234 113.173 3.39404C112.687 3.83063 112.233 4.30042 111.814 4.80339C113.849 6.89443 115.317 10.0884 115.811 13.788H117.768Z" fill="#E9EBEF"/>
      <path d="M114.105 13.7877C113.736 11.3399 112.886 9.08468 111.615 7.25842C111.34 6.86286 111.047 6.49299 110.745 6.15137C110.371 6.73957 110.039 7.3586 109.754 8.00588C110.911 9.50335 111.763 11.5094 112.152 13.7877H114.105Z" fill="#E9EBEF"/>
      <path d="M109.08 9.96973C108.772 11.1839 108.607 12.4652 108.607 13.7879H110.439C110.175 12.3903 109.716 11.0935 109.08 9.96973Z" fill="#E9EBEF"/>
      <path d="M125.228 13.7877C125.82 8.66695 128.014 5.21845 129.896 3.13768C130.052 2.96767 130.208 2.80273 130.363 2.64286C130.103 2.45509 129.833 2.27746 129.56 2.10745C129.435 2.23686 129.31 2.36881 129.19 2.5033C127.583 4.27449 125.766 6.9871 124.802 10.8035C124.506 9.26326 124.093 7.77628 123.565 6.36034C124.611 4.03343 125.909 2.23686 127.103 0.907196C126.782 0.787932 126.453 0.681356 126.121 0.584931C125.093 1.77249 124.014 3.28486 123.083 5.15755C122.412 3.60458 121.596 2.15312 120.647 0.838683C120.491 0.625531 120.335 0.414916 120.175 0.211914C119.44 0.323565 118.726 0.496117 118.034 0.716882C119.692 2.6251 121.042 5.04082 121.968 7.79911C121.626 8.77099 121.333 9.81391 121.101 10.9355C120.448 7.97674 119.277 5.26159 117.647 3.00319C117.228 2.42464 116.789 1.88668 116.33 1.39186C115.716 1.68622 115.124 2.02371 114.562 2.4018C117.182 5.03829 119.037 9.1034 119.562 13.7851H121.636C121.792 12.1992 122.075 10.7452 122.453 9.41805C122.82 10.8086 123.08 12.2702 123.223 13.7851H125.228V13.7877Z" fill="#E9EBEF"/>
      <path d="M128.565 13.7854C129.127 9.82916 130.851 7.14062 132.343 5.49386C132.446 5.38089 132.55 5.27044 132.653 5.16501C132.452 4.92151 132.242 4.68303 132.023 4.45459C129.921 6.5984 128.162 9.71118 127.615 13.7879H128.565V13.7854Z" fill="#E9EBEF"/>
      <path d="M132.243 13.7877C132.698 11.2752 133.72 9.43384 134.714 8.16343C134.572 7.8394 134.419 7.52309 134.254 7.21191C132.873 8.84492 131.742 11.036 131.279 13.7877H132.243Z" fill="#E9EBEF"/>
      <path d="M135.691 11.4546C135.381 12.1586 135.124 12.9373 134.943 13.7879H135.859C135.862 12.9933 135.804 12.2146 135.691 11.4546Z" fill="#E9EBEF"/>
    </svg>
  )
}

// ─── Nav data ─────────────────────────────────────────────────────────────────

interface NavItemDef {
  id: string
  label: string
  icon: React.ReactNode
  route?: string
  subItems?: string[]
}

const TOP_NAV: NavItemDef[] = [
  { id: 'home',         label: 'Home',             icon: <HomeIcon />,        route: '/' },
  { id: 'sales',        label: 'Sales',            icon: <CreditCardIcon /> },
  { id: 'terminals',    label: 'Terminals',        icon: <StorefrontIcon /> },
  { id: 'payments',     label: 'Payments',         icon: <SwapIcon /> },
  { id: 'catalogue',    label: 'Product catalogue', icon: <TagIcon /> },
  { id: 'business',     label: 'My business',      icon: <ApartmentIcon /> },
  { id: 'card-issuing', label: 'Card issuing',     icon: <CreditCardIcon /> },
  { id: 'cash-advance', label: 'Cash advance',     icon: <WrenchIcon /> },
]

const BOTTOM_NAV = [
  { id: 'settings',      label: 'Settings',      icon: <SettingsIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
  { id: 'help',          label: 'Help',          icon: <HelpIcon /> },
  { id: 'ai',            label: 'AI assistant',  icon: <SparkleIcon /> },
]

// ─── Sub-nav panel ────────────────────────────────────────────────────────────

function SubNavPanel({ item, activeSubItem, onSubItemClick }: {
  item: NavItemDef
  activeSubItem: string | null
  onSubItemClick: (sub: string) => void
}) {
  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 14 }}
      transition={{ duration: COLLAPSE_DUR * 0.75, ease: EASE }}
      style={{
        flex: '1 0 0',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 32,
        paddingBottom: 12,
        paddingLeft: 12,
        paddingRight: 12,
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        minWidth: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Category title — fixed at top, sub-items appear from below it */}
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '18px',
        color: 'white',
        whiteSpace: 'nowrap',
        paddingLeft: 8,
        paddingBottom: 12,
        flexShrink: 0,
      }}>
        {item.label}
      </span>

      {/* Sub-items — stagger up from below the title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {item.subItems?.map((sub, i) => {
          const isActive = activeSubItem === sub
          return (
            <motion.button
              key={sub}
              type="button"
              onClick={() => onSubItemClick(sub)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: EASE, delay: i * 0.045 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 8,
                borderRadius: 4,
                width: '100%',
                backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '18px',
                color: 'white',
                whiteSpace: 'nowrap',
              }}>
                {sub}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Side navigation ──────────────────────────────────────────────────────────

import React from 'react'

export function SideNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const [openItem, setOpenItem] = useState<NavItemDef | null>(null)
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null)

  const isCollapsed = openItem !== null

  function handleNavClick(item: NavItemDef) {
    if (item.subItems) {
      // Toggle: clicking open item closes it and goes back to dashboard
      if (openItem?.id === item.id) {
        setOpenItem(null)
        setActiveSubItem(null)
        navigate('/dashboard')
      } else {
        setOpenItem(item)
        setActiveSubItem(null)
        if (item.route) navigate(item.route)
      }
    } else {
      setOpenItem(null)
      setActiveSubItem(null)
      if (item.route) navigate(item.route)
    }
  }

  function handleSubItemClick(sub: string) {
    setActiveSubItem(sub)
  }

  function handleLogoClick() {
    resetOnboardingProgress()
    setOpenItem(null)
    setActiveSubItem(null)
    navigate('/dashboard')
  }

  // Derive active main item from current route
  const activeMainId = TOP_NAV.find(item => item.route === location.pathname)?.id ?? 'home'

  return (
    <nav
      aria-label="Main navigation"
      style={{ width: 272, height: '100%', display: 'flex', overflow: 'hidden' }}
    >
      {/* ── Left icon/label column ── */}
      <motion.div
        animate={{ width: isCollapsed ? 56 : 272 }}
        transition={{ duration: COLLAPSE_DUR, ease: EASE }}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          paddingTop: 32,
          paddingLeft: 8,
          paddingRight: 8,
          paddingBottom: 12,
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Logo — crossfades in place, no layout shifts */}
        <button
          type="button"
          onClick={handleLogoClick}
          aria-label="Go to dashboard and reset onboarding steps"
          style={{
            position: 'relative',
            height: 14,
            paddingLeft: 4,
            flexShrink: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCollapsed ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: LOGO_DUR, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: 0, left: 4 }}
              >
                <WorldlineLogoIcon />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: LOGO_DUR, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: 0, left: 4 }}
              >
                <WorldlineLogo />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Top nav items */}
        <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TOP_NAV.map((item) => {
              const isActive = item.id === activeMainId || openItem?.id === item.id
              const isClickable = !!(item.route || item.subItems)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => isClickable && handleNavClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: 8,
                    borderRadius: 4,
                    width: '100%',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: 'none',
                    cursor: isClickable ? 'pointer' : 'default',
                    textAlign: 'left',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                  {/* Label slides left and fades out when collapsing */}
                  <motion.span
                    animate={{
                      opacity: isCollapsed ? 0 : 1,
                      x: isCollapsed ? -10 : 0,
                    }}
                    transition={{
                      duration: isCollapsed ? LABEL_EXIT_DUR : 0.22,
                      delay: isCollapsed ? 0 : COLLAPSE_DUR * 0.55,
                      ease: EASE,
                    }}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: '18px',
                      color: 'white',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      pointerEvents: 'none',
                    }}
                  >
                    {item.label}
                  </motion.span>
                </button>
              )
            })}
          </div>

          {/* Bottom nav — fade out, swap layout, fade in */}
          <AnimatePresence mode="wait" initial={false}>
            {!isCollapsed ? (
              <motion.div
                key="bottom-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.18, ease: 'easeInOut', delay: COLLAPSE_DUR * 0.55 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
                style={{ display: 'flex', flexDirection: 'row', gap: 2, paddingTop: 8, paddingBottom: 8 }}
              >
                {BOTTOM_NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, padding: '4px 8px', borderRadius: 4, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: 0 }}
                  >
                    {item.icon}
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, lineHeight: '16px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', pointerEvents: 'none' }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="bottom-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.18, ease: 'easeInOut', delay: 0.12 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
                style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8, paddingBottom: 8 }}
              >
                {BOTTOM_NAV.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 4, backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    {item.icon}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Right sub-nav panel ── */}
      <AnimatePresence>
        {openItem && (
          <SubNavPanel
            item={openItem}
            activeSubItem={activeSubItem}
            onSubItemClick={handleSubItemClick}
          />
        )}
      </AnimatePresence>
    </nav>
  )
}
