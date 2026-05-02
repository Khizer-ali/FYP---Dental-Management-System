import re

with open("frontend/src/pages/PatientDetails.jsx", "r") as f:
    content = f.read()

# 1. Inject Medicine States
billing_states_pattern = r"(// Billing States.*?payment_datetime: new Date\(\)\.toUTCString\(\)\.slice\(0, 22\)\n  }\);)"
medicine_states = """
  // Medicine States
  const [medicines, setMedicines] = useState([]);
  const [medicineServices, setMedicineServices] = useState([
    { id: 1, name: '', qty: 1, price: 0, total: 0 }
  ]);
  const [medicineDetails, setMedicineDetails] = useState({
    staff_name: '',
    invoice_number: `MED-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    appointment_date: new Date().toLocaleDateString('en-GB'),
    date: new Date().toLocaleDateString('en-GB'),
    discount_type: '0',
    custom_discount: 0,
    outstanding_amount: 0,
    payment_method: 'ONLINE BANK TRANSFER',
    payment_datetime: new Date().toUTCString().slice(0, 22)
  });"""

content = re.sub(billing_states_pattern, r"\1\n" + medicine_states, content, flags=re.DOTALL)

# 2. Add to initial load
promise_all_pattern = r"(const \[patientRes.*?\] = await Promise\.all\(\[\n.*?fetch\(`\$\{API_BASE\}/patients/\$\{patientId\}/bills`\),\n.*?fetch\(`\$\{API_BASE\}/patients/\$\{patientId\}/appointments`\)\n        \]\);)"

# We don't really need to fetch medicines initially if they don't have the API, but let's add it if we can. Actually let's skip the initial load fetch to prevent 404s breaking the page load, since we can just lazily load it or they can implement it later. Or let's add it carefully. Let's skip modifying initialLoad to be safe.

# 3. Add to loadTabData
load_tab_pattern = r"(case 'billing':\n        await loadBills\(\);\n        break;)"
load_tab_replacement = r"\1\n      case 'medicine':\n        await loadMedicines();\n        break;"
content = re.sub(load_tab_pattern, load_tab_replacement, content)

# 4. Inject Medicine functions
billing_funcs_pattern = r"(// Billing functions.*?catch \(error\) \{\n      showMessage\('billingMessage', 'Network error: ' \+ error\.message, 'error'\);\n    \}\n  \};)"

# We can dynamically generate medicine functions by replacing 'bill' with 'medicine'
billing_funcs_match = re.search(billing_funcs_pattern, content, flags=re.DOTALL)
if billing_funcs_match:
    billing_funcs_code = billing_funcs_match.group(1)
    medicine_funcs_code = billing_funcs_code.replace("Billing functions", "Medicine functions")
    medicine_funcs_code = medicine_funcs_code.replace("loadBills", "loadMedicines")
    medicine_funcs_code = medicine_funcs_code.replace("setBills", "setMedicines")
    medicine_funcs_code = medicine_funcs_code.replace("bills", "medicines")
    medicine_funcs_code = medicine_funcs_code.replace("Bill", "Medicine")
    medicine_funcs_code = medicine_funcs_code.replace("bill", "medicine")
    # Restore some caps if needed:
    medicine_funcs_code = medicine_funcs_code.replace("calculateMedicineTotals", "calculateMedicineTotals")
    medicine_funcs_code = medicine_funcs_code.replace("handleMedicineServiceChange", "handleMedicineServiceChange")
    medicine_funcs_code = medicine_funcs_code.replace("handleSelectCatalogService", "handleSelectMedicineService")
    medicine_funcs_code = medicine_funcs_code.replace("addMedicineRow", "addMedicineRow")
    medicine_funcs_code = medicine_funcs_code.replace("removeMedicineRow", "removeMedicineRow")
    medicine_funcs_code = medicine_funcs_code.replace("saveMedicine", "saveMedicine")
    medicine_funcs_code = medicine_funcs_code.replace("SERVICE_CATALOG", "['Option 1', 'Option 2', 'Option 3']")
    # Fix the matching logic for options array:
    medicine_funcs_code = medicine_funcs_code.replace("['Option 1', 'Option 2', 'Option 3'].find(s => s.name === selectedName)", "['Option 1', 'Option 2', 'Option 3'].find(s => s === selectedName)")
    medicine_funcs_code = medicine_funcs_code.replace("match ? match.price : s.price", "0") # Hardcode price to 0 or leave it manual
    
    content = re.sub(billing_funcs_pattern, r"\1\n\n" + medicine_funcs_code, content, flags=re.DOTALL)

# 5. Add Tab button
tab_btn_pattern = r"(<button className={`tab \$\{activeTab === 'billing' \? 'active' : ''\}`} onClick=\{\(\) => setActiveTab\('billing'\)\}>\n            💳 Billing\n          </button>)"
tab_btn_replacement = r"\1\n          <button className={`tab ${activeTab === 'medicine' ? 'active' : ''}`} onClick={() => setActiveTab('medicine')}>\n            💊 Medicine\n          </button>"
content = re.sub(tab_btn_pattern, tab_btn_replacement, content)

# 6. Inject Medicine Tab JSX
billing_tab_pattern = r"(\{\/\* Billing Tab \*\/\}\n        \{activeTab === 'billing' && \(\n          <div id=\"billing\".*?</div>\n        \)\})"
billing_tab_match = re.search(billing_tab_pattern, content, flags=re.DOTALL)
if billing_tab_match:
    billing_tab_code = billing_tab_match.group(1)
    medicine_tab_code = billing_tab_code.replace("{/* Billing Tab */}", "{/* Medicine Tab */}")
    medicine_tab_code = medicine_tab_code.replace("activeTab === 'billing'", "activeTab === 'medicine'")
    medicine_tab_code = medicine_tab_code.replace("id=\"billing\"", "id=\"medicine\"")
    medicine_tab_code = medicine_tab_code.replace("billingMessage", "medicineMessage")
    medicine_tab_code = medicine_tab_code.replace("billDetails", "medicineDetails")
    medicine_tab_code = medicine_tab_code.replace("setBillDetails", "setMedicineDetails")
    medicine_tab_code = medicine_tab_code.replace("addBillRow", "addMedicineRow")
    medicine_tab_code = medicine_tab_code.replace("calculateBillTotals", "calculateMedicineTotals")
    medicine_tab_code = medicine_tab_code.replace("handleSelectCatalogService", "handleSelectMedicineService")
    medicine_tab_code = medicine_tab_code.replace("handleBillServiceChange", "handleMedicineServiceChange")
    medicine_tab_code = medicine_tab_code.replace("removeBillRow", "removeMedicineRow")
    medicine_tab_code = medicine_tab_code.replace("saveBill", "saveMedicine")
    medicine_tab_code = medicine_tab_code.replace("bills.length", "medicines.length")
    medicine_tab_code = medicine_tab_code.replace("bills.map", "medicines.map")
    medicine_tab_code = medicine_tab_code.replace("bill =>", "medicine =>")
    medicine_tab_code = medicine_tab_code.replace("bill.id", "medicine.id")
    medicine_tab_code = medicine_tab_code.replace("bill.invoice_number", "medicine.invoice_number")
    medicine_tab_code = medicine_tab_code.replace("bill.date", "medicine.date")
    medicine_tab_code = medicine_tab_code.replace("bill.staff_name", "medicine.staff_name")
    medicine_tab_code = medicine_tab_code.replace("bill.grand_total", "medicine.grand_total")
    medicine_tab_code = medicine_tab_code.replace("bill.discount_amount", "medicine.discount_amount")
    medicine_tab_code = medicine_tab_code.replace("bill.discount_percent", "medicine.discount_percent")
    medicine_tab_code = medicine_tab_code.replace("bill.items", "medicine.items")
    medicine_tab_code = medicine_tab_code.replace("billServices", "medicineServices")
    medicine_tab_code = medicine_tab_code.replace("Previous Bills", "Previous Medicines")
    medicine_tab_code = medicine_tab_code.replace("No bills saved yet", "No medicines saved yet")
    
    # Replace the select options specifically
    select_pattern = r"\{SERVICE_CATALOG\.map\(\(s\) => \(\n\s*<option key=\{s\.name\} value=\{s\.name\}>\n\s*\{s\.name\}\n\s*</option>\n\s*\)\)\}"
    select_replacement = """{['Option 1', 'Option 2', 'Option 3'].map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}"""
    medicine_tab_code = re.sub(select_pattern, select_replacement, medicine_tab_code)
    
    # Replace the select value logic
    val_pattern = r"SERVICE_CATALOG\.some\(s => s\.name === service\.name\)"
    val_replacement = "['Option 1', 'Option 2', 'Option 3'].includes(service.name)"
    medicine_tab_code = re.sub(val_pattern, val_replacement, medicine_tab_code)
    
    content = re.sub(billing_tab_pattern, r"\1\n\n" + medicine_tab_code, content, flags=re.DOTALL)

with open("frontend/src/pages/PatientDetails.jsx", "w") as f:
    f.write(content)

