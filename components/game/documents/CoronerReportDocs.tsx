export const CoronerReportPage1 = () => (
  <div className="bg-white border-2 border-[#333] p-8 font-mono text-sm">
    {/* Header */}
    <div className="text-center border-b-2 border-[#333] pb-4 mb-6">
      <div className="text-xs text-gray-600 mb-2">ENGLAND • COUNTY CORONER'S OFFICE</div>
      <h1 className="text-xl font-bold text-[#2a2520] mb-1">POST-MORTEM EXAMINATION REPORT</h1>
      <div className="text-xs text-gray-600">WICKHAM DISTRICT • CASE NO. 1986-0510-ASH</div>
    </div>

    {/* Report Details */}
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-bold text-xs text-gray-700">DECEASED:</p>
          <p>ASHCOMBE, Reginald Henry</p>
        </div>
        <div>
          <p className="font-bold text-xs text-gray-700">AGE / SEX:</p>
          <p>68 Years / Male</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-bold text-xs text-gray-700">DATE OF DEATH:</p>
          <p>10 May 1986 (approx. 21:00 hrs)</p>
        </div>
        <div>
          <p className="font-bold text-xs text-gray-700">DATE OF EXAMINATION:</p>
          <p>11 May 1986, 08:30 hrs</p>
        </div>
      </div>

      <div>
        <p className="font-bold text-xs text-gray-700">PLACE OF DEATH:</p>
        <p>Ashcombe Estate, Grand Staircase (Private Wing)</p>
        <p className="text-xs text-gray-600">Wickham, England</p>
      </div>

      <div>
        <p className="font-bold text-xs text-gray-700">EXAMINING PATHOLOGIST:</p>
        <p>Dr. Margaret Whitfield, MB ChB, FRCPath</p>
      </div>

      <div>
        <p className="font-bold text-xs text-gray-700">ATTENDING PHYSICIAN (SCENE):</p>
        <p>Dr. Leonard Vale, MD</p>
      </div>
    </div>

    {/* Section Divider */}
    <div className="border-t-2 border-[#333] my-6"></div>

    {/* Summary Section */}
    <div className="mb-6">
      <h2 className="font-bold text-sm mb-3 text-[#2a2520]">I. SUMMARY OF FINDINGS</h2>
      <div className="bg-[#f9f9f9] border border-[#666] p-4">
        <p className="mb-2"><span className="font-bold">CAUSE OF DEATH:</span></p>
        <p className="ml-4 mb-3">Acute craniocerebral trauma secondary to blunt force impact</p>
        
        <p className="mb-2"><span className="font-bold">MANNER OF DEATH:</span></p>
        <p className="ml-4 mb-3">ACCIDENTAL</p>

        <p className="mb-2"><span className="font-bold">MECHANISM:</span></p>
        <p className="ml-4">Fall from elevated height (staircase) resulting in fatal head injury</p>
      </div>
    </div>

    {/* External Examination */}
    <div className="mb-6">
      <h2 className="font-bold text-sm mb-3 text-[#2a2520]">II. EXTERNAL EXAMINATION</h2>
      <p className="mb-2">The body is that of a well-developed, well-nourished elderly white male appearing consistent with stated age of 68 years. Body is clothed in formal evening attire (black dinner jacket, white dress shirt, black trousers). Clothing shows minimal disruption.</p>
      
      <p className="mb-2"><span className="font-bold">Rigor Mortis:</span> Present, consistent with time elapsed since death (approx. 11 hours).</p>
      
      <p className="mb-2"><span className="font-bold">Livor Mortis:</span> Fixed, posterior distribution, consistent with supine position.</p>
      
      <p className="mb-2"><span className="font-bold">Body Temperature:</span> Cool to touch at time of examination (rectal temp: 22°C / 71.6°F).</p>
    </div>
  </div>
)

export const CoronerReportPage2 = () => (
  <div className="bg-white border-2 border-[#333] p-8 font-mono text-sm">
    {/* Header Reference */}
    <div className="text-right text-xs text-gray-600 mb-4">
      CASE NO. 1986-0510-ASH • PAGE 2 OF 3
    </div>

    {/* Injuries Section */}
    <div className="mb-6">
      <h2 className="font-bold text-sm mb-3 text-[#2a2520]">III. TRAUMATIC INJURIES</h2>
      
      <div className="mb-4">
        <p className="font-bold mb-2">A. HEAD & NECK</p>
        <div className="ml-4 space-y-2">
          <p><span className="font-bold">PRIMARY INJURY:</span> Large depressed skull fracture, right parietal-temporal region, measuring approximately 8 cm in diameter. Underlying brain contusion with subdural hematoma. This injury is <span className="font-bold underline">FATAL</span> and consistent with blunt force trauma from impact against hard surface.</p>
          
          <p><span className="font-bold">PATTERN:</span> Single point of impact to right side of head. Fracture line extends approximately 8 cm with associated soft tissue swelling and hemorrhage.</p>
          
          <p className="italic text-xs text-gray-700">NOTE: The mechanism of injury is consistent with a fall resulting in head striking a hard, flat surface. The force of impact was sufficient to cause immediate loss of consciousness and death.</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-bold mb-2">B. EXTREMITIES & TORSO</p>
        <div className="ml-4 space-y-2">
          <p>• Minor abrasions, left elbow (superficial)</p>
          <p>• Minor abrasions, right knee (superficial)</p>
          <p>• No fractures of limbs detected</p>
          <p>• No rib fractures</p>
          <p className="font-bold">• NO DEFENSIVE WOUNDS observed on hands or forearms</p>
        </div>
      </div>

      <div className="bg-[#fff3cd] border-l-4 border-[#856404] p-3 text-xs italic">
        <p className="font-bold mb-1">PATHOLOGIST'S OBSERVATION:</p>
        <p>The injury pattern is consistent with an accidental fall. The single-point head trauma indicates the deceased likely lost balance and fell, striking his head on a hard surface. The absence of defensive wounds suggests the fall was unexpected and the deceased was unable to break his fall.</p>
      </div>
    </div>

    {/* Internal Examination */}
    <div className="mb-6">
      <h2 className="font-bold text-sm mb-3 text-[#2a2520]">IV. INTERNAL EXAMINATION</h2>
      
      <p className="mb-2"><span className="font-bold">Cardiovascular:</span> Heart weight 380g. Moderate atherosclerotic disease noted in coronary arteries. No acute infarction.</p>
      
      <p className="mb-2"><span className="font-bold">Respiratory:</span> Lungs show mild congestion. No evidence of aspiration.</p>
      
      <p className="mb-2"><span className="font-bold">Gastrointestinal:</span> Stomach contains partially digested food consistent with recent meal. No abnormalities noted.</p>
      
      <p className="mb-2"><span className="font-bold">Hepatobiliary:</span> Liver shows mild fatty infiltration, consistent with age and social alcohol consumption.</p>
    </div>
  </div>
)

export const CoronerReportPage3 = () => (
  <div className="bg-white border-2 border-[#333] p-8 font-mono text-sm">
    {/* Header Reference */}
    <div className="text-right text-xs text-gray-600 mb-4">
      CASE NO. 1986-0510-ASH • PAGE 3 OF 3
    </div>

    {/* Toxicology */}
    <div className="mb-6">
      <h2 className="font-bold text-sm mb-3 text-[#2a2520]">V. TOXICOLOGY REPORT</h2>
      
      <div className="bg-[#f9f9f9] border border-[#666] p-4 space-y-2">
        <p><span className="font-bold">Blood Alcohol Concentration (BAC):</span> 0.04% (40 mg/dL)</p>
        <p className="text-xs ml-4 text-gray-700">Within range of social drinking. Below legal intoxication threshold.</p>
        
        <p><span className="font-bold">Additional Substances Detected:</span> None</p>
        
        <p><span className="font-bold">Prescription Medications:</span> Therapeutic levels of atorvastatin (cholesterol) detected, consistent with prescribed use.</p>
      </div>
    </div>

    {/* Scene Investigation Notes */}
    <div className="mb-6">
      <h2 className="font-bold text-sm mb-3 text-[#2a2520]">VI. SCENE INVESTIGATION NOTES</h2>
      
      <p className="mb-3">Information provided by attending physician (Dr. Vale) and witness statements:</p>
      
      <div className="ml-4 space-y-2 text-xs">
        <p>• Body discovered at base of grand staircase at approximately 21:05 hrs by spouse (Mrs. Veronica Ashcombe)</p>
        <p>• Wine glass found near body with red wine spillage on marble floor</p>
        <p>• Deceased was hosting charity gala event with approximately 40 guests in attendance</p>
        <p>• No witnesses to the fall observed</p>
        <p>• Location: Private wing of estate, grand staircase area</p>
        <p>• Lighting in area reported as adequate</p>
        <p>• No obvious environmental hazards or structural defects noted</p>
      </div>

      <div className="mt-4 bg-[#e8f4f8] border border-[#0c5460] p-3 text-xs">
        <p className="font-bold mb-1">ATTENDING PHYSICIAN'S STATEMENT (Dr. Leonard Vale):</p>
        <p className="italic">"I examined the deceased at approximately 21:10 hrs. He had no pulse and showed fixed, dilated pupils. Based on the nature of the injury and circumstances, death appeared to be the result of an accidental fall."</p>
      </div>
    </div>

    {/* Opinion */}
    <div className="mb-6">
      <h2 className="font-bold text-sm mb-3 text-[#2a2520]">VII. PATHOLOGIST'S OPINION</h2>
      
      <p className="mb-3">Based on the post-mortem examination, scene investigation, and toxicology results:</p>
      
      <div className="bg-[#f9f9f9] border-2 border-[#333] p-4">
        <p className="mb-2"><span className="font-bold">CAUSE OF DEATH:</span> Acute craniocerebral trauma</p>
        <p className="mb-2"><span className="font-bold">MANNER OF DEATH:</span> ACCIDENT</p>
        <p className="mt-4 text-xs">It is my professional opinion that Reginald Henry Ashcombe died as a result of an accidental fall resulting in fatal head trauma. The injury pattern, blood alcohol level, and circumstances are consistent with loss of balance leading to a fall. There is no evidence of foul play or third-party involvement at the time of this examination.</p>
      </div>
    </div>

    {/* Signature */}
    <div className="mt-8 pt-4 border-t border-[#666]">
      <div className="text-xl mb-2" style={{ fontFamily: "'Brush Script MT', cursive" }}>
        Dr. Margaret Whitfield
      </div>
      <p className="text-xs">Dr. Margaret Whitfield, MB ChB, FRCPath</p>
      <p className="text-xs">County Pathologist, Wickham District</p>
      <p className="text-xs mt-2">Date: 11 May 1986</p>
    </div>

    {/* Footer */}
    <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-300 pt-2">
      OFFICIAL DOCUMENT • WICKHAM COUNTY CORONER'S OFFICE • CONFIDENTIAL
    </div>
  </div>
)

