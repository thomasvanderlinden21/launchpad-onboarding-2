import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AI_BG = '#e6f0ef'
const USER_BG = '#dcf4fa'
const EASE = [0.22, 1, 0.36, 1] as const
const T: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px' }

type Phase = 'details' | 'location' | 'description' | 'mcc-suggest' | 'category-choice' | 'category-confirm' | 'turnover'

export interface Step3Data { salesLocation: string; description: string; category: string }
interface Step3Props {
  onComplete: (data: Step3Data) => void
}

function AiAvatar() {
  return (
    <div style={{ position: 'absolute', top: -12, left: -12, width: 17, height: 17, borderRadius: 9999, backgroundColor: '#277777', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <svg width={10} height={10} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 1l2.2 6.4L18 10l-5.8 2.6L10 19l-2.2-6.4L2 10l5.8-2.6L10 1z" fill="white" />
      </svg>
    </div>
  )
}

function UserAvatar() {
  return (
    <div style={{ position: 'absolute', top: -12, right: -9, width: 17, height: 17, borderRadius: 9999, backgroundColor: '#066076', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <circle cx={5} cy={3.5} r={2} fill="white" />
        <path d="M1 9c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth={1} strokeLinecap="round" />
      </svg>
    </div>
  )
}

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 12, width: '100%' }}>
      <div style={{ position: 'relative', backgroundColor: AI_BG, borderRadius: '0 12px 12px 12px', padding: 24, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AiAvatar />
        {children}
      </div>
    </div>
  )
}

function EditIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserBubble({ text, children, onEdit }: { text?: string; children?: React.ReactNode; onEdit?: () => void }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}
    >
      {onEdit && (
        <motion.button
          type="button"
          onClick={onEdit}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
          transition={{ duration: 0.15 }}
          aria-label="Edit"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9999, backgroundColor: '#e6f0ef', border: '1px solid #c8ddd9', color: '#277777', cursor: 'pointer', flexShrink: 0, pointerEvents: hovered ? 'auto' : 'none' }}
        >
          <EditIcon />
        </motion.button>
      )}
      <div style={{ position: 'relative', backgroundColor: USER_BG, borderRadius: '12px 0 12px 12px', padding: 12, filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))' }}>
        <UserAvatar />
        {children ?? <p style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{text}</p>}
      </div>
    </div>
  )
}

function AiTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'Raleway, Inter, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '32px', color: '#121621', margin: 0 }}>{children}</h2>
}

function AiHistoryBubble({ question }: { question: string }) {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ position: 'relative', backgroundColor: AI_BG, borderRadius: '0 12px 12px 12px', padding: '12px 16px', filter: 'drop-shadow(0px 4px 2px rgba(0,0,0,0.10))', display: 'inline-block', maxWidth: '80%' }}>
        <AiAvatar />
        <p style={{ ...T, color: '#121621', margin: 0 }}>{question}</p>
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: '18px', color: '#525d5d' }}>{children}</label>
}

const inputStyle: React.CSSProperties = {
  ...T,
  color: '#121621',
  backgroundColor: 'white',
  border: '1px solid #b4b7bc',
  borderRadius: 4,
  minHeight: 40,
  padding: '8px 10px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

function RadioOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minHeight: 40,
        backgroundColor: 'white',
        border: `1px solid ${selected ? '#277777' : '#e6ebeb'}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: 9999, border: `1px solid ${selected ? '#277777' : '#9ca4a6'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: '#277777' }} />}
      </span>
      <span style={{ ...T, color: '#121621' }}>{label}</span>
    </button>
  )
}

function PrimaryBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 44,
        backgroundColor: '#277777',
        border: '1px solid #277777',
        borderRadius: 4,
        padding: '8px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '18px',
        color: 'white',
        boxShadow: 'inset 0px -2px 0px rgba(0,0,0,0.16)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )
}

function SecondaryBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 44,
        backgroundColor: '#e6ebeb',
        border: '1px solid #b4b7bc',
        borderRadius: 4,
        padding: '8px 14px',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '18px',
        color: '#121621',
      }}
    >
      {label}
    </button>
  )
}

const SUGGESTION_RULES: { pattern: RegExp; mccs: [string, string, string] }[] = [
  { pattern: /coffee|café|cafe|espresso|latte|cappuccino|barista/i,       mccs: ['Eating Places and Restaurants', 'Bakeries', 'Miscellaneous Food Stores - Convenience Stores and Specialty Markets'] },
  { pattern: /restaurant|dining|diner|bistro|brasserie|eatery/i,          mccs: ['Eating Places and Restaurants', 'Caterers', 'Fast Food Restaurants'] },
  { pattern: /fast.?food|burger|pizza|sandwich|takeaway|takeout|kebab/i,  mccs: ['Fast Food Restaurants', 'Eating Places and Restaurants', 'Caterers'] },
  { pattern: /bar|pub|nightclub|cocktail|brewery|tavern|liquor|wine/i,    mccs: ['Drinking Places (Alcoholic Beverages) - Bars, Taverns, Nightclubs, Cocktail Lounges, and Discotheques', 'Eating Places and Restaurants', 'Package Stores - Beer, Wine, and Liquor'] },
  { pattern: /bakery|bakeries|pastry|bread|cake|patisserie/i,             mccs: ['Bakeries', 'Eating Places and Restaurants', 'Candy, Nut, and Confectionery Stores'] },
  { pattern: /grocery|supermarket|food store|convenience store/i,         mccs: ['Grocery Stores and Supermarkets', 'Miscellaneous Food Stores - Convenience Stores and Specialty Markets', 'Eating Places and Restaurants'] },
  { pattern: /clothing|fashion|apparel|garment|boutique|dress|wear/i,     mccs: ['Family Clothing Stores', 'Miscellaneous Apparel and Accessory Shops', 'Women Ready-To-Wear Stores'] },
  { pattern: /shoe|footwear|sneaker|boot/i,                               mccs: ['Shoe Stores', 'Commercial Footwear', 'Sporting Goods Stores'] },
  { pattern: /jewel|watch|silverware|gold/i,                              mccs: ['Jewelry Stores, Watches, Clocks, and Silverware Stores', 'Antique Shops - Sales, Repairs, and Restoration Services', 'Gift, Card, Novelty and Souvenir Shops'] },
  { pattern: /electronics|computer|phone|mobile|tech/i,                   mccs: ['Electronics Stores', 'Computers and Computer Peripheral Equipment and Software', 'Telecommunication Equipment and Telephone Sales'] },
  { pattern: /hair|salon|barber|beauty|spa|nail/i,                        mccs: ['Beauty and Barber Shops', 'Health and Beauty Spas', 'Massage Parlors'] },
  { pattern: /doctor|physician|medical|clinic|health/i,                   mccs: ['Doctors and Physicians (Not Elsewhere Classified)', 'Medical Services and Health Practitioners (Not Elsewhere Classified)', 'Nursing and Personal Care Facilities'] },
  { pattern: /dentist|dental|orthodont/i,                                  mccs: ['Dentists and Orthodontists', 'Medical and Dental Laboratories', 'Medical, Dental, Ophthalmic and Hospital Equipment and Supplies'] },
  { pattern: /pharmacy|drug store|chemist/i,                              mccs: ['Drug Stores and Pharmacies', 'Drugs, Drug Proprietaries, and Druggist Sundries', 'Medical, Dental, Ophthalmic and Hospital Equipment and Supplies'] },
  { pattern: /gym|fitness|sport|yoga|pilates|crossfit/i,                  mccs: ['Membership Clubs (Sports, Recreation, Athletic), Country Clubs, and Private Golf Courses', 'Sporting Goods Stores', 'Recreation Services (Not Elsewhere Classified)'] },
  { pattern: /hotel|motel|hostel|accommodation|lodging|resort/i,          mccs: ['Lodging - Hotels, Motels, Resorts, Central Reservation Services (Not Elsewhere Classified)', 'Trailer Parks and Campgrounds', 'Sporting and Recreational Camps'] },
  { pattern: /taxi|cab|ride|transport|delivery|courier/i,                 mccs: ['Taxicabs and Limousines', 'Courier Services - Air and Ground, and Freight Forwarders', 'Transportation Services (Not Elsewhere Classified)'] },
  { pattern: /gas|fuel|petrol|station|ev.?charg/i,                        mccs: ['Service Stations (With or without Ancillary Services)', 'Automated Fuel Dispensers', 'Electric Vehicle Charging'] },
  { pattern: /car|auto|vehicle|garage|mechanic|repair.?shop/i,            mccs: ['Automotive Service Shops (Non-Dealer)', 'Automotive Body Repair Shops', 'Automotive Parts and Accessories Stores'] },
  { pattern: /book|library|magazine|newspaper|stationery/i,               mccs: ['Book Stores', 'Stationery Stores, Office and School Supply Stores', 'News Dealers and Newsstands'] },
  { pattern: /school|educat|university|college|tutor|training/i,          mccs: ['Schools and Educational Services (Not Elsewhere Classified)', 'Colleges, Universities, Professional Schools, and Junior Colleges', 'Vocational and Trade Schools'] },
  { pattern: /consult|accounti|legal|lawyer|attorney|audit/i,             mccs: ['Management, Consulting, and Public Relations Services', 'Accounting, Auditing, and Bookkeeping Services', 'Legal Services and Attorneys'] },
  { pattern: /software|app|saas|digital|web|it.service|developer/i,       mccs: ['Computer Programming, Data Processing, and Integrated Systems Design Services', 'Computer Network/Information Services', 'Computer Software Stores'] },
  { pattern: /flower|florist|plant|nursery|garden/i,                      mccs: ['Florists', 'Nurseries and Lawn and Garden Supply Stores', 'Landscaping and Horticultural Services'] },
  { pattern: /pet|animal|vet|veterinary/i,                                mccs: ['Pet Shops, Pet Foods and Supplies Stores', 'Veterinary Services', 'Miscellaneous and Specialty Retail Shops'] },
  { pattern: /insurance|broker|financial|invest|bank/i,                   mccs: ['Insurance Sales, Underwriting, and Premiums', 'Security Brokers/Dealers', 'Financial Institutions - Automated Cash Disbursements'] },
  { pattern: /clean|laundry|dry.?clean|wash|janitor/i,                    mccs: ['Cleaning, Maintenance, and Janitorial Services', 'Laundry, Cleaning, and Garment Services', 'Dry Cleaners'] },
  { pattern: /construction|contractor|builder|plumb|electric|roof/i,      mccs: ['General Contractors - Residential and Commercial', 'Special Trade Contractors (Not Elsewhere Classified)', 'Heating, Plumbing, and Air Conditioning Contractors'] },
  { pattern: /furniture|interior|home.?decor|appliance/i,                 mccs: ['Furniture, Home Furnishings, and Equipment Stores, Except Appliances', 'Household Appliance Stores', 'Miscellaneous Home Furnishing Specialty Stores'] },
  { pattern: /photo|studio|portrait|wedding.?photo/i,                     mccs: ['Photographic Studios', 'Photofinishing Laboratories and Photo Developing', 'Commercial Photography, Art, and Graphics'] },
  { pattern: /art|gallery|craft|antique|collectible/i,                    mccs: ['Art Dealers and Galleries', "Artist's Supply and Craft Shops", 'Antique Shops - Sales, Repairs, and Restoration Services'] },
  { pattern: /theater|cinema|movie|concert|ticket|event/i,                mccs: ['Motion Picture Theaters', 'Ticket Agencies and Theatrical Producers (Except Motion Pictures)', 'Bands, Orchestras, and Miscellaneous Entertainers (Not Elsewhere Classified)'] },
  { pattern: /travel|tour|holiday|vacation|flight|airline/i,              mccs: ['Travel Agencies and Tour Operators', 'Airlines and Air Carriers (Not Elsewhere Classified)', 'Lodging - Hotels, Motels, Resorts, Central Reservation Services (Not Elsewhere Classified)'] },
]

function suggestMCCs(description: string): [string, string, string] {
  for (const rule of SUGGESTION_RULES) {
    if (rule.pattern.test(description)) return rule.mccs
  }
  return ['Eating Places and Restaurants', 'Fast Food Restaurants', 'Bakeries and Pastries']
}

const MCC_DATA: Record<string, Record<string, string[]>> = {
  'Food & Drink': {
    'Restaurants & fast food': ['Eating Places and Restaurants', 'Fast Food Restaurants'],
    'Groceries & convenience': ['Grocery Stores and Supermarkets', 'Miscellaneous Food Stores - Convenience Stores and Specialty Markets'],
    'Catering': ['Caterers'],
    'Bars & nightlife': ['Drinking Places (Alcoholic Beverages) - Bars, Taverns, Nightclubs, Cocktail Lounges, and Discotheques'],
    'Specialty food stores': ['Bakeries and Pastries', 'Bakeries', 'Freezer and Locker Meat Provisioners', 'Dairy Products Stores', 'Candy, Nut, and Confectionery Stores'],
    'Alcohol retail': ['Package Stores - Beer, Wine, and Liquor'],
    'Agriculture & farm co-ops': ['Agricultural Co-operatives'],
  },
  'Shopping & Retail': {
    'Apparel & accessories': ['Family Clothing Stores', 'Miscellaneous Apparel and Accessory Shops', 'Men and Women Clothing Stores', 'Women Ready-To-Wear Stores', 'Children and Infant Wear Stores', 'Sports and Riding Apparel Stores', 'Wig and Toupee Stores', 'Women Accessory and Specialty Shops', 'Tailors, Seamstresses, Mending, and Alterations', 'Men and Boys Clothing and Accessories Stores', 'Men, Women, and Children Uniforms and Commercial Clothing', 'Piece Goods, Notions, and Other Dry Goods', 'Clothing Rental - Costumes, Uniforms, Formal Wear', 'Commercial Footwear', 'Furriers and Fur Shops'],
    'Department, discount & general merchandise': ['Miscellaneous General Merchandise', 'Department Stores', 'Variety Stores', 'Discount Stores', 'Duty Free Stores', 'Wholesale Clubs'],
    'Beauty retail (cosmetics)': ['Cosmetic Stores'],
    'Specialty retail': ['Miscellaneous and Specialty Retail Shops', 'Florists', 'Pet Shops, Pet Foods and Supplies Stores', 'Cigar Stores and Stands', 'Gift, Card, Novelty and Souvenir Shops', 'Used Merchandise and Secondhand Stores', 'News Dealers and Newsstands', 'Swimming Pools - Sales and Service', 'Antique Shops - Sales, Repairs, and Restoration Services', 'Jewelry Stores, Watches, Clocks, and Silverware Stores', 'Luggage and Leather Goods Stores', 'Tent and Awning Shops', 'Electric Razor Stores - Sales and Service', 'Pawn Shops', 'Antique Reproductions', 'Glassware/Crystal Stores'],
    'Sporting goods & bicycles': ['Sporting Goods Stores', 'Bicycle Shops - Sales and Service'],
    'Hobbies & toys': ['Hobby, Toy, and Game Shops'],
    'Books & stationery': ['Book Stores', 'Stationery Stores, Office and School Supply Stores'],
    'Electronics, computers & media': ['Electronics Stores', 'Telecommunication Equipment and Telephone Sales', 'Computers and Computer Peripheral Equipment and Software', 'Music Stores - Musical Instruments, Pianos, and Sheet Music', 'Computer Software Stores', 'Record Stores', 'Camera and Photographic Supply Stores', 'Typewriter Stores - Sales, Rentals, and Service'],
    'Art & collectibles': ['Art Dealers and Galleries', "Artist's Supply and Craft Shops", 'Stamp and Coin Stores', 'Religious Goods Stores'],
    'Crafts & sewing retail': ['Sewing, Needlework, Fabric and Piece Goods Stores'],
    'Digital goods': ['Digital Goods Media - Books, Movies, Digital artwork/images, Music'],
    'Footwear': ['Shoe Stores'],
  },
  'Health & Medical': {
    'Clinics & practitioners': ['Doctors and Physicians (Not Elsewhere Classified)', 'Chiropractors', 'Medical Services and Health Practitioners (Not Elsewhere Classified)', 'Osteopaths', 'Podiatrists and Chiropodists'],
    'Dental': ['Dentists and Orthodontists'],
    'Vision & optical': ['Opticians, Optical Goods, and Eyeglasses', 'Optometrists and Ophthalmologists'],
    'Pharmacies & drugs': ['Drug Stores and Pharmacies', 'Drugs, Drug Proprietaries, and Druggist Sundries'],
    'Medical equipment & supplies': ['Medical, Dental, Ophthalmic and Hospital Equipment and Supplies', 'Orthopedic Goods - Prosthetic Devices', 'Hearing Aids - Sales, Service, and Supply'],
    'Hospitals & care facilities': ['Nursing and Personal Care Facilities', 'Hospitals'],
    'Labs': ['Medical and Dental Laboratories'],
    'Veterinary': ['Veterinary Services'],
    'Medical transport': ['Ambulance Services'],
  },
  'Personal Services': {
    'Beauty & wellness services': ['Beauty and Barber Shops', 'Health and Beauty Spas', 'Massage Parlors'],
    'Other personal services': ['Miscellaneous Personal Services (Not Elsewhere Classified)'],
    'Counseling & personal support': ['Counseling Services - Debt, Marriage, and Personal'],
    'Funeral services': ['Funeral Services and Crematories'],
    'Laundry & cleaning services': ['Laundry, Cleaning, and Garment Services', 'Dry Cleaners', 'Laundries - Family and Commercial', 'Carpet and Upholstery Cleaning'],
    'Cleaning & pest control services': ['Cleaning, Maintenance, and Janitorial Services', 'Exterminating and Disinfecting Services'],
    'Photo services': ['Photographic Studios', 'Photofinishing Laboratories and Photo Developing'],
    'Repairs (non-automotive)': ['Miscellaneous Repair Shops and Related Services', 'Electronics Repair Shops', 'Electrical and Small Appliance Repair Shops', 'Furniture - Reupholstery, Repair, and Refinishing', 'Watch, Clock and Jewelry Repair', 'Welding Services', 'Air Conditioning and Refrigeration Repair Shops'],
    'Shoe & clothing care': ['Shoe Repair Shops, Shoe Shine Parlors, and Hat Cleaning Shops'],
    'Cleaning-related products': ['Specialty Cleaning, Polishing and Sanitation Preparations'],
  },
  'Home, Construction & Utilities': {
    'Home furnishings & appliances': ['Furniture, Home Furnishings, and Equipment Stores, Except Appliances', 'Miscellaneous Home Furnishing Specialty Stores', 'Household Appliance Stores', 'Drapery, Window Covering, and Upholstery Stores', 'Floor Covering Stores', 'Fireplace, Fireplace Screens and Accessories Stores'],
    'Home improvement stores & garden': ['Home Supply Warehouse Stores', 'Hardware Stores', 'Lumber and Building Materials Stores', 'Nurseries and Lawn and Garden Supply Stores', 'Glass, Paint, and Wallpaper Stores'],
    'Contractors & trades': ['Special Trade Contractors (Not Elsewhere Classified)', 'Heating, Plumbing, and Air Conditioning Contractors', 'General Contractors - Residential and Commercial', 'Electrical Contractors', 'Carpentry Contractors', 'Concrete Work Contractors', 'Masonry, Stonework, Tile Setting, Plastering and Insulation Contractors', 'Roofing, Siding, and Sheet Metal Work Contractors'],
    'Construction/industrial supplies': ['Construction Materials (Not Elsewhere Classified)', 'Industrial Supplies (Not Elsewhere Classified)', 'Plumbing and Heating Equipment and Supplies', 'Hardware, Equipment and Supplies', 'Electrical Parts and Equipment', 'Commercial Equipment (Not Elsewhere Classified)', 'Metal Service Centers and Offices', 'Durable Goods (Not Elsewhere Classified)', 'Chemicals and Allied Products (Not Elsewhere Classified)', 'Paints, Varnishes and Supplies'],
    'Equipment & tool rental': ['Equipment, Tool, Furniture, and Appliance Rental and Leasing'],
    'Landscaping & outdoor services': ['Landscaping and Horticultural Services'],
    'Utilities': ['Utilities - Electric, Gas, Water, and Sanitary'],
  },
  'Automotive': {
    'Vehicle dealers': ['Car and Truck Dealers (New and Used) Sales, Service, Repairs, Parts, and Leasing', 'Car and Truck Dealers (Used Only) Sales, Service, Repairs, Parts, and Leasing', 'Motorcycle Shops and Dealers', 'Miscellaneous Automotive, Aircraft, and Farm Equipment Dealers (Not Elsewhere Classified)', 'Camper, Recreational and Utility Trailer Dealers', 'Boat Dealers', 'Mobile Home Dealers', 'Motor Homes Dealers'],
    'Service, repair & wash': ['Automotive Service Shops (Non-Dealer)', 'Automotive Body Repair Shops', 'Tire Retreading and Repair Shops', 'Towing Services', 'Car Washes', 'Automotive Paint Shops'],
    'Parts, tires & supplies': ['Automotive Parts and Accessories Stores', 'Automotive Tire Stores', 'Motor Vehicle Supplies and New Parts', 'Wrecking and Salvage Yards'],
    'Fuel & stations': ['Service Stations (With or without Ancillary Services)', 'Automated Fuel Dispensers', 'Electric Vehicle Charging', 'Fuel Dealers - Fuel Oil, Wood, Coal, and Liquefied Petroleum', 'Petroleum and Petroleum Products'],
  },
  'Travel, Transportation & Logistics': {
    'Lodging & camps': ['Lodging - Hotels, Motels, Resorts, Central Reservation Services (Not Elsewhere Classified)', 'Trailer Parks and Campgrounds', 'Sporting and Recreational Camps'],
    'Travel services': ['Travel Agencies and Tour Operators'],
    'Passenger transport': ['Taxicabs and Limousines', 'Local and Suburban Commuter Passenger Transportation, Including Ferries', 'Passenger Railways', 'Bus Lines'],
    'Parking': ['Parking Lots, Parking Meters and Garages'],
    'Freight, courier & storage': ['Railroads', 'Motor Freight Carriers and Trucking - Local and Long Distance, Moving and Storage Companies, and Local Delivery Services', 'Courier Services - Air and Ground, and Freight Forwarders', 'Public Warehousing and Storage - Farm Products, Refrigerated Goods, Household Goods, and Storage'],
    'Transportation services (other)': ['Transportation Services (Not Elsewhere Classified)', 'Tolls and Bridge Fees'],
    'Vehicle rentals': ['Automobile Rental Agency', 'Truck and Utility Trailer Rentals', 'Motor Home and Recreational Vehicle Rentals'],
    'Air travel': ['Airports, Flying Fields, and Airport Terminals', 'Airlines and Air Carriers (Not Elsewhere Classified)'],
    'Sea & marina services': ['Marinas, Marine Service, and Supplies', 'Boat Rentals and Leasing', 'Steamship and Cruise Lines'],
  },
  'Entertainment, Sports & Recreation': {
    'Sports & clubs': ['Commercial Sports, Professional Sports Clubs, Athletic Fields, and Sports Promoters', 'Membership Clubs (Sports, Recreation, Athletic), Country Clubs, and Private Golf Courses', 'Public Golf Courses'],
    'Attractions & recreation': ['Recreation Services (Not Elsewhere Classified)', 'Tourist Attractions and Exhibits', 'Bands, Orchestras, and Miscellaneous Entertainers (Not Elsewhere Classified)', 'Amusement Parks, Circuses, Carnivals, and Fortune Tellers', 'Aquariums, Seaquariums, Dolphinariums, and Zoos', 'Bowling Alleys', 'Billiard and Pool Establishments'],
    'Arts, shows & ticketing': ['Ticket Agencies and Theatrical Producers (Except Motion Pictures)', 'Dance Halls, Studios and Schools', 'Motion Picture Theaters', 'DVD/Video Tape Rental Stores'],
    'Gaming & arcades': ['Video Game Arcades/Establishments', 'Video Amusement Game Supplies'],
  },
  'Business, Tech & Finance': {
    'Business services': ['Management, Consulting, and Public Relations Services', 'Computer Programming, Data Processing, and Integrated Systems Design Services', 'Computer Maintenance, Repair and Services (Not Elsewhere Classified)', 'Computer Network/Information Services', 'Information Retrieval Services', 'Telecommunication Services, including Local and Long Distance Calls, Credit Card Calls, Calls Through Use of Magnetic-Stripe-Reading Telephones, and Fax Services', 'Stenographic and Secretarial Support Services', 'Employment Agencies and Temporary Help Services', 'Buying and Shopping Services and Clubs', 'Door-To-Door Sales', 'Real Estate Agents and Managers', 'Detective Agencies, Protective Services, and Security Services, including Armored Cars, and Guard Dogs'],
    'Professional services': ['Legal Services and Attorneys', 'Accounting, Auditing, and Bookkeeping Services', 'Tax Preparation Services', 'Architectural, Engineering, and Surveying Services'],
    'Finance & insurance': ['Financial Institutions - Automated Cash Disbursements', 'Insurance Sales, Underwriting, and Premiums', 'Money Transfer', 'Security Brokers/Dealers'],
    'Design, print & media services': ['Commercial Photography, Art, and Graphics', 'Miscellaneous Publishing and Printing', 'Quick Copy, Reproduction, and Blueprinting Services', 'Typesetting, Plate Making and Related Services'],
    'TV/streaming services': ['Cable, Satellite and Other Pay Television/Radio/Streaming Services'],
    'Other business/tech': ['Stationery, Office Supplies, Printing and Writing Paper', 'Books, Periodicals and Newspapers', 'Florists Supplies, Nursery Stock and Flowers', 'Nondurable Goods (Not Elsewhere Classified)', 'Photographic, Photocopy, Microfilm Equipment and Supplies', 'Office and Commercial Furniture', 'Testing Laboratories (Non-Medical Testing)'],
  },
  'Government, Education & Membership': {
    'Government & payments': ['Government Services (Not Elsewhere Classified)', 'Bail and Bond Payments', 'Fines', 'Court Costs, Including Alimony and Child Support', 'Tax Payments', 'Postal Services - Government Only'],
    'Education': ['Schools and Educational Services (Not Elsewhere Classified)', 'Correspondence Schools', 'Colleges, Universities, Professional Schools, and Junior Colleges', 'Vocational and Trade Schools', 'Elementary and Secondary Schools', 'Business and Secretarial Schools'],
    'Child care': ['Child Care Services'],
    'Membership & religion': ['Civic, Social, and Fraternal Associations', 'Membership Organizations (Not Elsewhere Classified)', 'Religious Organizations', 'Automobile Associations'],
  },
  'Other': {
    'Other': ['Other'],
  },
}

export function Step3({ onComplete }: Step3Props) {
  const [phase, setPhase] = useState<Phase>('details')

  const [differentTradingName, setDifferentTradingName] = useState<boolean>(true)
  const [tradingName, setTradingName] = useState('Beantastic Coffee')
  const [vatId, setVatId] = useState('BE0123456789')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [website, setWebsite] = useState('')

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('Eating Places and Restaurants')
  const [mccSuggestion, setMccSuggestion] = useState<string>('')
  const [categoryGroup, setCategoryGroup] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [finalCategory, setFinalCategory] = useState('')
  const [averageTransactionValue, setAverageTransactionValue] = useState('')
  const [monthlyTurnover, setMonthlyTurnover] = useState('')

  const detailsComplete = vatId.trim() !== '' && (customerEmail.trim() !== '' || customerPhone.trim() !== '') && website.trim() !== '' && (!differentTradingName || tradingName.trim() !== '')

  const descriptionScore = useMemo(() => {
    const text = description.trim()
    const words = text.split(/\s+/).filter(Boolean).length
    if (!text) return { tone: 'neutral' as const, label: '' }
    if (words < 5) return { tone: 'warn' as const, label: 'Narrowing it down' }
    return { tone: 'good' as const, label: 'This is great company type identified' }
  }, [description])

  const mccSuggestions = useMemo(() => suggestMCCs(description), [description])

  const canContinueDescription = description.trim().split(/\s+/).filter(Boolean).length >= 5
  const canContinueMccSuggest = mccSuggestion !== ''
  const canContinueCategoryChoice = categoryGroup !== '' && subCategory !== '' && finalCategory !== ''
  const canContinueTurnover = averageTransactionValue !== '' && monthlyTurnover !== ''

  const salesLocationSummary = 'Sales location is 1442 Chaussee de Haecht'

  const categoryOptions = Object.keys(MCC_DATA)
  const subCategoryOptions = categoryGroup ? Object.keys(MCC_DATA[categoryGroup] ?? {}) : []
  const descriptionOptions = categoryGroup && subCategory ? (MCC_DATA[categoryGroup]?.[subCategory] ?? []) : []

  const TRANSACTION_VALUE_OPTIONS = [
    { value: 'under-10', label: 'Under EUR 10' },
    { value: '10-25', label: 'EUR 10 - EUR 25' },
    { value: '25-50', label: 'EUR 25 - EUR 50' },
    { value: '50-plus', label: 'More than EUR 50' },
  ]

  const MONTHLY_TURNOVER_OPTIONS = [
    { value: 'under-5k', label: 'Under EUR 5,000' },
    { value: '5k-20k', label: 'EUR 5,000 - EUR 20,000' },
    { value: '20k-50k', label: 'EUR 20,000 - EUR 50,000' },
    { value: '50k-plus', label: 'More than EUR 50,000' },
  ]

  return (
    <div style={{ width: '100%', paddingBottom: 32 }}>
      <AnimatePresence mode="wait">
        {phase === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }}>
            <AiBubble>
              <AiTitle>Tell us more about your company</AiTitle>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 500, lineHeight: '16px', color: '#525d5d', margin: 0 }}>Do you operate under a different trading name?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <RadioOption label="Yes" selected={differentTradingName} onClick={() => setDifferentTradingName(true)} />
                  <RadioOption label="No" selected={!differentTradingName} onClick={() => setDifferentTradingName(false)} />
                </div>
              </div>

              {differentTradingName && (
                <input value={tradingName} onChange={e => setTradingName(e.target.value)} style={inputStyle} />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FieldLabel>VAT ID</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <input value={vatId} onChange={e => setVatId(e.target.value)} style={{ ...inputStyle, paddingRight: 34 }} />
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#121621', display: 'inline-flex' }}>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.5} />
                      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                      <circle cx={12} cy={17} r=".5" fill="currentColor" stroke="currentColor" strokeWidth={1} />
                    </svg>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FieldLabel>Provide the best customer service contact for customers</FieldLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="Email address" type="email" style={inputStyle} />
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone number" type="tel" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FieldLabel>Website or online presence</FieldLabel>
                <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. https://website.com" style={inputStyle} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryBtn label="Continue" onClick={() => setPhase('location')} disabled={!detailsComplete} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'location' && (
          <motion.div key="location" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AiHistoryBubble question="Tell us more about your company" />
            <UserBubble onEdit={() => setPhase('details')}>
              {[differentTradingName ? tradingName : 'Beantastic Coffee', `VAT ID ${vatId}`, customerEmail, customerPhone, website].filter(Boolean).map((line, i) => (
                <p key={i} style={{ ...T, color: '#121621', margin: 0, textAlign: 'right' }}>{line}</p>
              ))}
            </UserBubble>
            <AiBubble>
              <AiTitle>Where will your terminal be used?</AiTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <p style={{ ...T, color: '#121621', margin: 0 }}>Beantastic Coffee</p>
                <p style={{ ...T, color: '#121621', margin: 0 }}>Chaussee de Haecht, 1442</p>
                <p style={{ ...T, color: '#121621', margin: 0 }}>1130</p>
                <p style={{ ...T, color: '#121621', margin: 0 }}>Brussels</p>
                <p style={{ ...T, color: '#121621', margin: 0 }}>Belgium</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <SecondaryBtn label="Add location" onClick={() => {}} />
                <PrimaryBtn label="Confirm location" onClick={() => setPhase('description')} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'description' && (
          <motion.div key="description" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AiHistoryBubble question="Where will your terminal be used?" />
            <UserBubble text={salesLocationSummary} onEdit={() => setPhase('location')} />
            <AiBubble>
              <AiTitle>What products or services does your company provide?</AiTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder='Beantastic Coffee is a coffee shop that...'
                  style={{ ...inputStyle, minHeight: 92, resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                />
                {descriptionScore.label && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: '16px', color: '#6b7676' }}>{descriptionScore.label}</span>
                    <span style={{ width: 12, height: 12, borderRadius: 9999, backgroundColor: descriptionScore.tone === 'good' ? '#17a673' : '#f4b000' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SecondaryBtn label="Choose from categories" onClick={() => setPhase('category-choice')} />
                <PrimaryBtn label="Continue" onClick={() => setPhase('mcc-suggest')} disabled={!canContinueDescription} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'mcc-suggest' && (
          <motion.div key="mcc-suggest" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AiBubble>
              <AiTitle>Which description best describes your company?</AiTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mccSuggestions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setMccSuggestion(opt); setCategory(opt) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', padding: '14px 16px',
                      backgroundColor: 'white',
                      border: `1px solid ${mccSuggestion === opt ? '#277777' : '#e6ebeb'}`,
                      borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: 9999, flexShrink: 0,
                      border: `1px solid ${mccSuggestion === opt ? '#277777' : '#9ca4a6'}`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {mccSuggestion === opt && <span style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: '#277777' }} />}
                    </span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: '22px', color: '#121621' }}>{opt}</span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <SecondaryBtn label="Back" onClick={() => setPhase('description')} />
                <PrimaryBtn label="Continue" onClick={() => setPhase('category-confirm')} disabled={!canContinueMccSuggest} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'category-choice' && (
          <motion.div key="category-choice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AiBubble>
              <AiTitle>What products or services does your company provide?</AiTitle>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Category</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={categoryGroup}
                      onChange={e => {
                        setCategoryGroup(e.target.value)
                        setSubCategory('')
                        setFinalCategory('')
                      }}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: categoryGroup ? '#121621' : '#9ca4a6' }}
                    >
                      <option value="" disabled>Please select</option>
                      {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Sub category</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={subCategory}
                      onChange={e => {
                        setSubCategory(e.target.value)
                        setFinalCategory('')
                      }}
                      disabled={categoryGroup === ''}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: subCategory ? '#121621' : '#9ca4a6', cursor: categoryGroup === '' ? 'not-allowed' : 'pointer' }}
                    >
                      <option value="" disabled>Please select</option>
                      {subCategoryOptions.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Description</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={finalCategory}
                      onChange={e => {
                        setFinalCategory(e.target.value)
                        setCategory(e.target.value)
                      }}
                      disabled={subCategory === ''}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: finalCategory ? '#121621' : '#9ca4a6', cursor: subCategory === '' ? 'not-allowed' : 'pointer' }}
                    >
                      <option value="" disabled>Please select</option>
                      {descriptionOptions.map(desc => <option key={desc} value={desc}>{desc}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SecondaryBtn label="Type description" onClick={() => setPhase('description')} />
                <PrimaryBtn label="Continue" onClick={() => setPhase('turnover')} disabled={!canContinueCategoryChoice} />
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'category-confirm' && (
          <motion.div key="category-confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AiBubble>
              <AiTitle>Based on your description, is it correct to say your business category is:</AiTitle>
              <div style={{ backgroundColor: 'white', border: '1px solid #e6ebeb', borderRadius: 4, minHeight: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                <span style={{ display: 'inline-flex', color: '#277777' }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 9l2-5h14l2 5v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth={1.5} />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth={1.5} />
                  </svg>
                </span>
                <span style={{ ...T, color: '#121621' }}>{category}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SecondaryBtn label="Choose from categories" onClick={() => setPhase('category-choice')} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <SecondaryBtn label="No, go back" onClick={() => setPhase('description')} />
                  <PrimaryBtn label="Yes, continue" onClick={() => setPhase('turnover')} />
                </div>
              </div>
            </AiBubble>
          </motion.div>
        )}

        {phase === 'turnover' && (
          <motion.div key="turnover" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AiHistoryBubble question="What products or services does your company provide?" />
            <UserBubble text={`${differentTradingName ? tradingName : 'Beantastic Coffee'} — ${category}`} />
            <AiBubble>
              <AiTitle>This will help us estimate your annual turnover</AiTitle>
              <p style={{ ...T, color: '#121621', margin: 0 }}>Don&apos;t worry if you don&apos;t know the exact range, it&apos;s just an estimate.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Estimated average value per transaction</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={averageTransactionValue}
                      onChange={e => setAverageTransactionValue(e.target.value)}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: averageTransactionValue ? '#121621' : '#6b7676' }}
                    >
                      <option value="" disabled>Please select</option>
                      {TRANSACTION_VALUE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <FieldLabel>Estimated monthly card transaction turnover</FieldLabel>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                    <select
                      value={monthlyTurnover}
                      onChange={e => setMonthlyTurnover(e.target.value)}
                      style={{ ...T, flex: 1, border: 'none', outline: 'none', background: 'none', appearance: 'none', color: monthlyTurnover ? '#121621' : '#6b7676' }}
                    >
                      <option value="" disabled>Please select</option>
                      {MONTHLY_TURNOVER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#525d5d" strokeWidth={1.5} strokeLinecap="round" /></svg>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PrimaryBtn label="Continue" onClick={() => {
                  onComplete({ salesLocation: salesLocationSummary, description: description || category, category })
                }} disabled={!canContinueTurnover} />
              </div>
            </AiBubble>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
