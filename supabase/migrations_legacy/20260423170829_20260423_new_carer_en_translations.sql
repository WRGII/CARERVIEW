/*
  # New Carer Section — English Translation Keys

  Adds all English-language translation keys for the New Carer resource section.

  1. New namespace: `new_carer.*`
     - Landing page: hero, intro, summary blocks, module nav descriptions
     - Big Picture page
     - Care Plan page (8 pillars with strategic questions)
     - Roles page (responsibility areas)
     - Living Arrangements page
     - Documents & Authority page
     - Health Coordination page
     - Sustainability page
     - Review Plan page
     - Supporting worksheet resource cards (5 worksheets)

  2. New nav key: `nav.new_carer`

  3. Only English (locale='en') is seeded. Other locales use the English fallback
     mechanism already built into the LocaleProvider until translated.

  4. Uses INSERT ... ON CONFLICT DO UPDATE to be safe on re-runs.
*/

INSERT INTO ui_translations (locale, key, value) VALUES

-- Nav
('en', 'nav.new_carer', 'New Carer'),

-- =========================================================
-- LANDING PAGE
-- =========================================================
('en', 'new_carer.page_title', 'New Carer — Where to Start'),
('en', 'new_carer.meta_desc', 'A planning framework for first-time family carers. Understand the scope of your caring role, make key decisions early, and build a plan that holds up over time.'),
('en', 'new_carer.hero_eyebrow', 'Planning framework for first-time carers'),
('en', 'new_carer.hero_title', 'New Carer'),
('en', 'new_carer.hero_subtitle', 'Start with a plan, not panic'),
('en', 'new_carer.hero_intro', 'Becoming a carer often begins suddenly. A diagnosis, a fall, a hospital discharge, a decline that has been building for years. Most people respond by jumping straight into tasks. That is understandable — but it is not enough.'),
('en', 'new_carer.hero_intro_2', 'The real challenge is bigger than daily help. You may be stepping into care coordination, family communication, health decisions, legal authority, financial oversight, housing choices, and long-term planning. This section is here to help you step back, think clearly, and build a plan that can hold up as needs change.'),

-- "This section helps you" block
('en', 'new_carer.helps_title', 'This section helps you:'),
('en', 'new_carer.helps_1', 'Understand the full scope of the caring role'),
('en', 'new_carer.helps_2', 'Make key early decisions before crisis forces them'),
('en', 'new_carer.helps_3', 'Build a care plan that can adapt as needs change'),

-- "Use this section when" block
('en', 'new_carer.use_when_title', 'Use this section when:'),
('en', 'new_carer.use_when_1', 'You have just become responsible for someone''s care'),
('en', 'new_carer.use_when_2', 'Your family is reacting but does not yet have a plan'),
('en', 'new_carer.use_when_3', 'You are unsure which decisions need to be made first'),
('en', 'new_carer.use_when_4', 'You want to think strategically before choosing services or living arrangements'),

-- Module nav section
('en', 'new_carer.modules_heading', 'Planning modules'),
('en', 'new_carer.modules_intro', 'Work through these modules in any order, or start at the beginning. Each covers a distinct part of the bigger planning picture.'),

-- Module card titles and descriptions
('en', 'new_carer.mod_big_picture_title', 'The Big Picture'),
('en', 'new_carer.mod_big_picture_desc', 'Understand that caregiving is broader than daily tasks — and why getting the big picture right matters first.'),
('en', 'new_carer.mod_care_plan_title', 'Build Your Care Plan'),
('en', 'new_carer.mod_care_plan_desc', 'A structured eight-pillar framework for thinking through the full scope of your caring role.'),
('en', 'new_carer.mod_roles_title', 'Who Does What'),
('en', 'new_carer.mod_roles_desc', 'Clarify responsibilities across family and supporters before confusion and resentment take hold.'),
('en', 'new_carer.mod_living_title', 'Home, Housing and Care Setting'),
('en', 'new_carer.mod_living_desc', 'Think strategically about where and how care should happen — before emotion drives the decision.'),
('en', 'new_carer.mod_docs_title', 'Documents, Decisions and Authority'),
('en', 'new_carer.mod_docs_desc', 'Understand why legal and administrative readiness matters early — and what to get in order.'),
('en', 'new_carer.mod_health_title', 'Health and Coordination System'),
('en', 'new_carer.mod_health_desc', 'Build one reliable system for health information, appointments, medications, and care notes.'),
('en', 'new_carer.mod_sustain_title', 'Planning for Sustainability'),
('en', 'new_carer.mod_sustain_desc', 'A care plan fails when it assumes the caregiver has unlimited capacity. Build sustainability in from the start.'),
('en', 'new_carer.mod_review_title', 'Review and Change Over Time'),
('en', 'new_carer.mod_review_desc', 'Care needs change, family circumstances change, and the plan must change with them.'),

-- Supporting worksheets section on landing page
('en', 'new_carer.worksheets_heading', 'Supporting worksheets'),
('en', 'new_carer.worksheets_intro', 'These practical worksheets support the planning work in this section. Use them alongside the modules above.'),

-- =========================================================
-- SHARED / NAVIGATION
-- =========================================================
('en', 'new_carer.back_to_new_carer', 'Back to New Carer'),
('en', 'new_carer.continue_planning', 'Continue planning'),
('en', 'new_carer.next_module', 'Next module'),
('en', 'new_carer.explore_modules', 'Explore all modules'),

-- =========================================================
-- BIG PICTURE PAGE
-- =========================================================
('en', 'new_carer.bp_page_title', 'The Big Picture — New Carer'),
('en', 'new_carer.bp_meta_desc', 'Understanding the full scope of caregiving before getting lost in daily tasks.'),
('en', 'new_carer.bp_eyebrow', 'Module 1'),
('en', 'new_carer.bp_title', 'The Big Picture'),
('en', 'new_carer.bp_subtitle', 'Understand the scope before you plan the tasks'),
('en', 'new_carer.bp_intro', 'Caregiving often begins suddenly. Before you can manage the day-to-day, you need to understand what you are actually taking on.'),
('en', 'new_carer.bp_scope_heading', 'What the caring role actually covers'),
('en', 'new_carer.bp_scope_body', 'Most people picture caregiving as helping with meals, transport, or personal care. Those things matter — but the role is usually much broader. Depending on the situation, caregiving can include:'),
('en', 'new_carer.bp_scope_1', 'Coordinating health appointments and care providers'),
('en', 'new_carer.bp_scope_2', 'Managing medications and treatment information'),
('en', 'new_carer.bp_scope_3', 'Making decisions on behalf of or alongside the person being cared for'),
('en', 'new_carer.bp_scope_4', 'Communicating with family members who are not present'),
('en', 'new_carer.bp_scope_5', 'Managing financial and legal administration'),
('en', 'new_carer.bp_scope_6', 'Overseeing housing, safety, and living arrangements'),
('en', 'new_carer.bp_scope_7', 'Planning for how needs will change over time'),
('en', 'new_carer.bp_goal_heading', 'The goal is not to do everything immediately'),
('en', 'new_carer.bp_goal_body', 'The goal is to understand the scope — and then build a workable plan. Trying to manage a complex caring role without a clear picture of what it involves leads to exhaustion, missed decisions, and avoidable crises.'),
('en', 'new_carer.bp_risks_heading', 'What becomes difficult when the big picture is unclear'),
('en', 'new_carer.bp_risk_1', 'Needs go unrecognised until they become urgent'),
('en', 'new_carer.bp_risk_2', 'No one knows who is authorised to make key decisions'),
('en', 'new_carer.bp_risk_3', 'Family members pull in different directions without a shared plan'),
('en', 'new_carer.bp_risk_4', 'Health information is scattered across multiple people and providers'),
('en', 'new_carer.bp_risk_5', 'Housing and care arrangements are unstable or unsustainable'),
('en', 'new_carer.bp_risk_6', 'Administrative tasks pile up and become overwhelming'),
('en', 'new_carer.bp_risk_7', 'The primary carer burns out before help is arranged'),
('en', 'new_carer.bp_callout', 'A caring role becomes much harder when authority, responsibilities, and information are unclear. The work of building a plan now is far less costly than managing a crisis later.'),

-- =========================================================
-- CARE PLAN PAGE
-- =========================================================
('en', 'new_carer.cp_page_title', 'Build Your Care Plan — New Carer'),
('en', 'new_carer.cp_meta_desc', 'A structured eight-pillar framework for first-time carers to think through the full scope of their caring role.'),
('en', 'new_carer.cp_eyebrow', 'Module 2'),
('en', 'new_carer.cp_title', 'Build Your Care Plan'),
('en', 'new_carer.cp_subtitle', 'A strategic framework for the full caring role'),
('en', 'new_carer.cp_intro', 'A care plan is not a task list. It is a shared understanding of what needs to happen, who is responsible, and how decisions will be made. The framework below covers eight distinct areas. Work through each one — not to have perfect answers immediately, but to identify what needs thinking through.'),
('en', 'new_carer.cp_pillars_heading', 'The eight planning pillars'),
('en', 'new_carer.cp_questions_label', 'Questions to think through'),
('en', 'new_carer.cp_callout', 'Good caregiving planning is about sustainability, not heroics. The goal is not perfection — it is a workable plan that can be reviewed and adjusted as needs change.'),

-- Pillar 1
('en', 'new_carer.cp_p1_title', 'Understand the care need'),
('en', 'new_carer.cp_p1_body', 'Before making any decisions, get a clear picture of what the person actually needs now and what they are likely to need over the coming months.'),
('en', 'new_carer.cp_p1_q1', 'What support is needed now versus what may be needed in six to twelve months?'),
('en', 'new_carer.cp_p1_q2', 'Has a formal assessment been completed, or is the care plan based on assumption?'),
('en', 'new_carer.cp_p1_q3', 'What does the person being cared for want — and have they been asked?'),
('en', 'new_carer.cp_p1_q4', 'Are there conditions, medications, or risks that need to be understood before making housing or care decisions?'),

-- Pillar 2
('en', 'new_carer.cp_p2_title', 'Clarify decision authority'),
('en', 'new_carer.cp_p2_body', 'Unclear authority is one of the most common sources of family conflict in caregiving situations. Establish early who is authorised to make which decisions.'),
('en', 'new_carer.cp_p2_q1', 'Who is legally allowed to access medical records or make health decisions if capacity changes?'),
('en', 'new_carer.cp_p2_q2', 'Who has authority over financial decisions?'),
('en', 'new_carer.cp_p2_q3', 'Has anyone been formally designated as a decision-maker, or has it simply been assumed?'),
('en', 'new_carer.cp_p2_q4', 'If family members disagree, who has the final say?'),

-- Pillar 3
('en', 'new_carer.cp_p3_title', 'Build the care team'),
('en', 'new_carer.cp_p3_body', 'Care rarely works well when one person tries to do everything. Identify who can contribute, what they can realistically do, and what professional support may be needed.'),
('en', 'new_carer.cp_p3_q1', 'Who in the family or social network can contribute, and in what capacity?'),
('en', 'new_carer.cp_p3_q2', 'Is one person carrying too much of the care burden by default?'),
('en', 'new_carer.cp_p3_q3', 'What professional or paid support is needed now or in the near future?'),
('en', 'new_carer.cp_p3_q4', 'Who is the primary point of contact for health providers and services?'),
('en', 'new_carer.cp_p3_q5', 'Is there a backup plan if the primary carer becomes unavailable?'),

-- Pillar 4
('en', 'new_carer.cp_p4_title', 'Decide the care model and living arrangement'),
('en', 'new_carer.cp_p4_body', 'Where and how care happens is one of the most significant decisions you will make. It affects cost, sustainability, safety, and quality of life for everyone involved.'),
('en', 'new_carer.cp_p4_q1', 'Is the current living arrangement safe and workable for the next six to twelve months?'),
('en', 'new_carer.cp_p4_q2', 'What are the realistic long-term options — staying at home, moving, or a care facility?'),
('en', 'new_carer.cp_p4_q3', 'Who would be affected by a change in living arrangement, and have they been involved?'),
('en', 'new_carer.cp_p4_q4', 'Is the chosen model financially sustainable?'),

-- Pillar 5
('en', 'new_carer.cp_p5_title', 'Create one system for health and care coordination'),
('en', 'new_carer.cp_p5_body', 'Scattered health information creates avoidable risk. Establish one place where diagnoses, medications, appointments, and care notes are kept and accessible to those who need them.'),
('en', 'new_carer.cp_p5_q1', 'Is there a single, reliable record of current diagnoses, medications, and providers?'),
('en', 'new_carer.cp_p5_q2', 'Who is responsible for keeping health information up to date?'),
('en', 'new_carer.cp_p5_q3', 'How will important care updates be shared with family members who are not present?'),
('en', 'new_carer.cp_p5_q4', 'What happens in an emergency — is the right information accessible to the right people?'),

-- Pillar 6
('en', 'new_carer.cp_p6_title', 'Stabilise paperwork, money, and administration'),
('en', 'new_carer.cp_p6_body', 'Administrative overwhelm is a common but avoidable problem. Get the key documents, accounts, and records organised early — not in a crisis.'),
('en', 'new_carer.cp_p6_q1', 'Are key documents located, organised, and accessible?'),
('en', 'new_carer.cp_p6_q2', 'Who manages financial accounts and recurring bills?'),
('en', 'new_carer.cp_p6_q3', 'Are insurance policies, pension details, and benefits known and documented?'),
('en', 'new_carer.cp_p6_q4', 'Is there a record of important contacts, account numbers, and passwords?'),

-- Pillar 7
('en', 'new_carer.cp_p7_title', 'Protect the carer''s sustainability'),
('en', 'new_carer.cp_p7_body', 'A caregiving plan that relies on one person working indefinitely without support will eventually fail. Sustainability must be built into the plan from the start.'),
('en', 'new_carer.cp_p7_q1', 'Is the primary carer''s current workload realistic over the medium term?'),
('en', 'new_carer.cp_p7_q2', 'What respite or backup support exists or needs to be arranged?'),
('en', 'new_carer.cp_p7_q3', 'What are the financial, employment, and health impacts on the primary carer?'),
('en', 'new_carer.cp_p7_q4', 'Is asking for help early part of the plan — or is help only expected in a crisis?'),

-- Pillar 8
('en', 'new_carer.cp_p8_title', 'Review and update the plan as needs change'),
('en', 'new_carer.cp_p8_body', 'A care plan is not a static document. Health changes, family circumstances change, and the plan must change with them.'),
('en', 'new_carer.cp_p8_q1', 'How often will the care plan be formally reviewed?'),
('en', 'new_carer.cp_p8_q2', 'Who is responsible for calling a review when something significant changes?'),
('en', 'new_carer.cp_p8_q3', 'What would trigger an urgent review outside of the scheduled cycle?'),

-- =========================================================
-- ROLES PAGE
-- =========================================================
('en', 'new_carer.roles_page_title', 'Who Does What — New Carer'),
('en', 'new_carer.roles_meta_desc', 'Clarify caregiving responsibilities across family and supporters before confusion and resentment take hold.'),
('en', 'new_carer.roles_eyebrow', 'Module 3'),
('en', 'new_carer.roles_title', 'Who Does What'),
('en', 'new_carer.roles_subtitle', 'Clarity over responsibility prevents confusion and resentment'),
('en', 'new_carer.roles_intro', 'In most families, one person becomes the default carer — usually whoever was closest, most available, or simply said yes first. That person then ends up doing everything, not because it was agreed, but because it was never discussed.'),
('en', 'new_carer.roles_one_person_heading', 'One person may lead, but should not do everything'),
('en', 'new_carer.roles_one_person_body', 'Care has different categories of responsibility. Assigning ownership — even informally — reduces confusion, prevents duplication, and makes it easier to ask for help. Support can come from family, friends, neighbours, and professionals.'),
('en', 'new_carer.roles_callout', 'The key question is not "Who cares most?" — it is "Who owns which responsibility?"'),
('en', 'new_carer.roles_areas_heading', 'Key responsibility areas'),
('en', 'new_carer.roles_area_household_title', 'Household support'),
('en', 'new_carer.roles_area_household_body', 'Meals, cleaning, shopping, home maintenance, and daily domestic tasks.'),
('en', 'new_carer.roles_area_personal_title', 'Personal care and mobility'),
('en', 'new_carer.roles_area_personal_body', 'Bathing, dressing, continence care, mobility assistance, and physical safety.'),
('en', 'new_carer.roles_area_emotional_title', 'Emotional support'),
('en', 'new_carer.roles_area_emotional_body', 'Companionship, conversation, checking in, and reducing isolation.'),
('en', 'new_carer.roles_area_health_title', 'Health and medical coordination'),
('en', 'new_carer.roles_area_health_body', 'Appointments, medications, test results, provider communication, and care notes.'),
('en', 'new_carer.roles_area_scheduling_title', 'Scheduling and communication'),
('en', 'new_carer.roles_area_scheduling_body', 'Coordinating between family members, updating those not present, and managing appointments.'),
('en', 'new_carer.roles_area_admin_title', 'Financial and legal administration'),
('en', 'new_carer.roles_area_admin_body', 'Bills, accounts, benefits, documents, and any legal authority arrangements.'),
('en', 'new_carer.roles_area_respite_title', 'Backup and respite coverage'),
('en', 'new_carer.roles_area_respite_body', 'Covering for the primary carer, providing breaks, and being available in an emergency.'),
('en', 'new_carer.roles_questions_heading', 'Questions to think through'),
('en', 'new_carer.roles_q1', 'Have these responsibility areas been explicitly discussed, or have they just happened by default?'),
('en', 'new_carer.roles_q2', 'Is one person carrying significantly more than others — and is that sustainable?'),
('en', 'new_carer.roles_q3', 'Are there family members who want to contribute but do not know how?'),
('en', 'new_carer.roles_q4', 'Which areas need professional or paid support because family capacity is not enough?'),
('en', 'new_carer.roles_q5', 'If the primary carer became unavailable tomorrow, what would break immediately?'),

-- =========================================================
-- LIVING ARRANGEMENTS PAGE
-- =========================================================
('en', 'new_carer.living_page_title', 'Home, Housing and Care Setting — New Carer'),
('en', 'new_carer.living_meta_desc', 'Think strategically about where and how care should happen before emotion drives the decision.'),
('en', 'new_carer.living_eyebrow', 'Module 4'),
('en', 'new_carer.living_title', 'Home, Housing and Care Setting'),
('en', 'new_carer.living_subtitle', 'A strategic decision, not an emotional reflex'),
('en', 'new_carer.living_intro', 'Where care happens is one of the most consequential decisions in the caring role. It affects safety, cost, family dynamics, daily workload, and long-term sustainability. It is also a decision that is often made too quickly, under pressure, and without fully thinking through the implications.'),
('en', 'new_carer.living_options_heading', 'The main options'),
('en', 'new_carer.living_opt1_title', 'Staying in the person''s current home'),
('en', 'new_carer.living_opt1_body', 'Often the preferred option for independence and familiarity. Requires an honest assessment of safety, accessibility, and available support.'),
('en', 'new_carer.living_opt2_title', 'Moving into a family home'),
('en', 'new_carer.living_opt2_body', 'Can work well with the right planning. Requires clear thinking about space, supervision, impact on the household, and long-term viability.'),
('en', 'new_carer.living_opt3_title', 'Paid in-home support'),
('en', 'new_carer.living_opt3_body', 'Professional carers visiting the home to support with personal care, meals, or overnight stays. Costs and availability vary significantly.'),
('en', 'new_carer.living_opt4_title', 'Assisted living or residential care'),
('en', 'new_carer.living_opt4_body', 'Appropriate when care needs exceed what can be safely managed at home. A long-term decision that benefits from careful research and preparation.'),
('en', 'new_carer.living_dimensions_heading', 'Planning dimensions to assess'),
('en', 'new_carer.living_dim_safety', 'Safety — Are there fall risks, medication risks, or supervision needs that the current setting cannot meet?'),
('en', 'new_carer.living_dim_space', 'Space — Is there adequate room, privacy, and accessibility for the person and their care needs?'),
('en', 'new_carer.living_dim_supervision', 'Supervision — How much daily or overnight oversight is required?'),
('en', 'new_carer.living_dim_transport', 'Transportation — Can the person access appointments and services from this location?'),
('en', 'new_carer.living_dim_help', 'Available help — Is there reliable support nearby, or is the carer isolated?'),
('en', 'new_carer.living_dim_medical', 'Medical access — How close are hospitals, specialists, and pharmacies?'),
('en', 'new_carer.living_dim_afford', 'Affordability — Is the chosen arrangement financially sustainable long-term?'),
('en', 'new_carer.living_dim_viability', 'Long-term viability — Will this arrangement still work if needs increase?'),
('en', 'new_carer.living_moving_in_heading', 'Before moving someone into your home, think beyond goodwill'),
('en', 'new_carer.living_moving_in_body', 'Moving a family member into your home is a significant decision that often feels obvious in a crisis. Before committing, be honest about the full impact: the effect on your own household, the supervision demands, the financial cost, the limits of your own capacity, and what happens if the needs escalate beyond what you can manage. Goodwill is not a care plan.'),
('en', 'new_carer.living_questions_heading', 'Questions to think through'),
('en', 'new_carer.living_q1', 'Has the current arrangement been assessed honestly for safety and sustainability?'),
('en', 'new_carer.living_q2', 'Is this decision being driven by what the person needs, or by what is easiest in the short term?'),
('en', 'new_carer.living_q3', 'Have all realistic options been considered, not just the most emotionally immediate one?'),
('en', 'new_carer.living_q4', 'What is the plan if the current arrangement stops working?'),
('en', 'new_carer.living_q5', 'Who else is affected by this decision, and have they been included in the discussion?'),

-- =========================================================
-- DOCUMENTS & AUTHORITY PAGE
-- =========================================================
('en', 'new_carer.docs_page_title', 'Documents, Decisions and Authority — New Carer'),
('en', 'new_carer.docs_meta_desc', 'Understand why legal and administrative readiness matters early in the caring role.'),
('en', 'new_carer.docs_eyebrow', 'Module 5'),
('en', 'new_carer.docs_title', 'Documents, Decisions and Authority'),
('en', 'new_carer.docs_subtitle', 'Unclear authority creates major problems — especially in a crisis'),
('en', 'new_carer.docs_intro', 'Many family carers discover too late that being the nearest relative does not automatically mean having legal authority. Medical staff, financial institutions, and care providers all have their own rules about who they can speak to and act upon instruction from.'),
('en', 'new_carer.docs_authority_heading', 'Authority must be established, not assumed'),
('en', 'new_carer.docs_authority_body', 'If the person being cared for still has full capacity to make decisions, now is the time to get the right documents in place. If capacity has already changed, the options are more limited and the process more complex. Do not wait.'),
('en', 'new_carer.docs_governance_callout', 'Caregiving needs a governance structure. Decisions become harder in a crisis if records and authority have not been sorted in advance.'),
('en', 'new_carer.docs_areas_heading', 'What to organise and confirm'),
('en', 'new_carer.docs_area_health_title', 'Health decision authority'),
('en', 'new_carer.docs_area_health_body', 'Who is authorised to speak to medical teams, access records, and make treatment decisions if the person cannot?'),
('en', 'new_carer.docs_area_financial_title', 'Financial authority'),
('en', 'new_carer.docs_area_financial_body', 'Who can manage bank accounts, pay bills, access pensions, and make financial decisions?'),
('en', 'new_carer.docs_area_legal_title', 'Legal documents'),
('en', 'new_carer.docs_area_legal_body', 'Are the relevant legal arrangements in place — or do they need to be established while the person still has capacity?'),
('en', 'new_carer.docs_area_prefs_title', 'Care preferences'),
('en', 'new_carer.docs_area_prefs_body', 'Has the person expressed their wishes about care, living arrangements, medical treatment, and end of life? Are those wishes documented?'),
('en', 'new_carer.docs_area_records_title', 'Organised records and access'),
('en', 'new_carer.docs_area_records_body', 'Is there one place where critical documents, account details, passwords, and contacts are stored and accessible to the right people?'),
('en', 'new_carer.docs_area_emergency_title', 'Emergency readiness'),
('en', 'new_carer.docs_area_emergency_body', 'In an emergency, can the right information be found quickly? Does the right person have access?'),
('en', 'new_carer.docs_questions_heading', 'Questions to think through'),
('en', 'new_carer.docs_q1', 'Does the current carer have the legal authority they need, or are they acting informally?'),
('en', 'new_carer.docs_q2', 'Are the relevant authority documents in place, and are they the right ones for the situation?'),
('en', 'new_carer.docs_q3', 'Where are the key documents physically located, and who knows where they are?'),
('en', 'new_carer.docs_q4', 'Has the person expressed their care preferences in a way that is documented and accessible?'),
('en', 'new_carer.docs_q5', 'What would happen if the primary carer became incapacitated — could someone else step in immediately?'),
('en', 'new_carer.docs_disclaimer', 'This section provides general planning guidance only. It is not legal advice. Requirements for authority documents vary by country and jurisdiction. Seek professional legal advice where needed.'),

-- =========================================================
-- HEALTH COORDINATION PAGE
-- =========================================================
('en', 'new_carer.health_page_title', 'Health and Coordination System — New Carer'),
('en', 'new_carer.health_meta_desc', 'Build one reliable system for health information, appointments, medications, and care notes.'),
('en', 'new_carer.health_eyebrow', 'Module 6'),
('en', 'new_carer.health_title', 'Health and Coordination System'),
('en', 'new_carer.health_subtitle', 'One system, not scattered notes across multiple people'),
('en', 'new_carer.health_intro', 'One of the most common problems in complex caring situations is that health information is scattered. Different family members hold different pieces. Providers have their own records that others cannot access. Medications get managed informally. Nobody has the full picture.'),
('en', 'new_carer.health_risk_callout', 'Scattered information creates avoidable risk. The person being cared for may receive conflicting treatments, important changes may not be communicated, and emergencies become harder to manage without clear, accessible information.'),
('en', 'new_carer.health_system_heading', 'What one coordination system covers'),
('en', 'new_carer.health_sys_1_title', 'Diagnoses and conditions'),
('en', 'new_carer.health_sys_1_body', 'A clear record of all current diagnoses, relevant history, and known risks.'),
('en', 'new_carer.health_sys_2_title', 'Medications'),
('en', 'new_carer.health_sys_2_body', 'A complete, up-to-date medication list including dosages, prescribing clinicians, and any known interactions or side effects.'),
('en', 'new_carer.health_sys_3_title', 'Appointments'),
('en', 'new_carer.health_sys_3_body', 'Scheduled appointments with all providers, including follow-ups, specialists, and allied health.'),
('en', 'new_carer.health_sys_4_title', 'Provider contacts'),
('en', 'new_carer.health_sys_4_body', 'Names, roles, and contact details for all health and care providers involved in the person''s care.'),
('en', 'new_carer.health_sys_5_title', 'Treatment updates'),
('en', 'new_carer.health_sys_5_body', 'A log of significant changes, new diagnoses, treatment decisions, and outcomes.'),
('en', 'new_carer.health_sys_6_title', 'Shared care notes'),
('en', 'new_carer.health_sys_6_body', 'Observations, changes in condition, and day-to-day care notes accessible to all relevant carers.'),
('en', 'new_carer.health_sys_7_title', 'Emergency information'),
('en', 'new_carer.health_sys_7_body', 'A summary of critical information that can be accessed immediately in an emergency.'),
('en', 'new_carer.health_continuity_heading', 'This is about continuity and oversight, not clinical advice'),
('en', 'new_carer.health_continuity_body', 'You are not being asked to become a medical expert. The goal is to ensure that accurate, current information is available to the right people at the right time — and that nothing important falls through the gaps between providers, family members, and care settings.'),
('en', 'new_carer.health_questions_heading', 'Questions to think through'),
('en', 'new_carer.health_q1', 'Does one person have a complete and current picture of the person''s health status?'),
('en', 'new_carer.health_q2', 'Is the medication list accurate, complete, and accessible to relevant carers?'),
('en', 'new_carer.health_q3', 'How are important health updates communicated between family members who are not present?'),
('en', 'new_carer.health_q4', 'What happens in a medical emergency — is the right information immediately accessible?'),
('en', 'new_carer.health_q5', 'Who is responsible for keeping this information up to date as things change?'),

-- =========================================================
-- SUSTAINABILITY PAGE
-- =========================================================
('en', 'new_carer.sustain_page_title', 'Planning for Sustainability — New Carer'),
('en', 'new_carer.sustain_meta_desc', 'A care plan that assumes the caregiver has unlimited capacity will eventually fail. Build sustainability in from the start.'),
('en', 'new_carer.sustain_eyebrow', 'Module 7'),
('en', 'new_carer.sustain_title', 'Planning for Sustainability'),
('en', 'new_carer.sustain_subtitle', 'The caregiver is not an unlimited resource'),
('en', 'new_carer.sustain_intro', 'This is one of the most important principles in caregiving, and one of the most frequently ignored. Families often build care plans that implicitly rely on one person being available indefinitely, without time limits, at whatever intensity is required. That plan will fail.'),
('en', 'new_carer.sustain_callout', 'The caregiver is not an unlimited resource. A care plan that does not account for the carer''s own limits, needs, and sustainability is not a complete plan.'),
('en', 'new_carer.sustain_pressures_heading', 'What wears carers down'),
('en', 'new_carer.sustain_pressure_1', 'Time — caregiving often expands to fill all available hours, including nights and weekends'),
('en', 'new_carer.sustain_pressure_2', 'Emotional strain — grief, guilt, frustration, and the weight of watching someone decline'),
('en', 'new_carer.sustain_pressure_3', 'Physical demands — particularly where personal care or mobility support is involved'),
('en', 'new_carer.sustain_pressure_4', 'Work and financial pressure — reduced hours, career interruption, or lost income'),
('en', 'new_carer.sustain_pressure_5', 'Isolation — stepping back from friendships, social life, and personal interests'),
('en', 'new_carer.sustain_pressure_6', 'Absence of backup — carrying the full responsibility without anyone to step in'),
('en', 'new_carer.sustain_plan_heading', 'Build sustainability into the plan'),
('en', 'new_carer.sustain_plan_body', 'Sustainability is not about doing less. It is about building the structure that allows the caring role to continue without burning out the people who carry it. That means identifying limits early, putting backup in place, and asking for help before the crisis, not after it.'),
('en', 'new_carer.sustain_respite_heading', 'Respite and escalation'),
('en', 'new_carer.sustain_respite_body', 'Respite — planned breaks from caring — is not a luxury. It is a maintenance requirement. Build in regular relief, identify who can cover, and have a clear escalation plan for when care needs intensify beyond current capacity.'),
('en', 'new_carer.sustain_questions_heading', 'Questions to think through'),
('en', 'new_carer.sustain_q1', 'Is the primary carer''s current workload realistic over the next six to twelve months?'),
('en', 'new_carer.sustain_q2', 'What would happen to the care arrangement if the primary carer became ill or unavailable?'),
('en', 'new_carer.sustain_q3', 'Is there a regular break built into the plan — or is the carer expected to continue indefinitely without relief?'),
('en', 'new_carer.sustain_q4', 'Are the financial, employment, and health impacts on the carer being monitored and managed?'),
('en', 'new_carer.sustain_q5', 'Is help being asked for early — or is the carer waiting until they reach a breaking point?'),

-- =========================================================
-- REVIEW PLAN PAGE
-- =========================================================
('en', 'new_carer.review_page_title', 'Review and Change Over Time — New Carer'),
('en', 'new_carer.review_meta_desc', 'Care needs change. The plan must change with them. A framework for periodic review.'),
('en', 'new_carer.review_eyebrow', 'Module 8'),
('en', 'new_carer.review_title', 'Review and Change Over Time'),
('en', 'new_carer.review_subtitle', 'A care plan is not a static document'),
('en', 'new_carer.review_intro', 'The care plan you build today will need to change. Health changes. Family availability changes. Financial circumstances change. What worked at the start may become unsafe, unworkable, or unsustainable over time. Building a review process into the plan from the beginning prevents small changes from becoming crises.'),
('en', 'new_carer.review_why_heading', 'Why plans need regular review'),
('en', 'new_carer.review_why_1', 'Health and cognitive status can shift gradually or suddenly'),
('en', 'new_carer.review_why_2', 'The primary carer''s own capacity changes over time'),
('en', 'new_carer.review_why_3', 'Family members move, change jobs, or face their own health challenges'),
('en', 'new_carer.review_why_4', 'Financial situations and available resources evolve'),
('en', 'new_carer.review_why_5', 'Care arrangements that were safe six months ago may no longer be adequate'),
('en', 'new_carer.review_why_6', 'Support services, funding, and local resources change'),
('en', 'new_carer.review_framework_heading', 'A simple review framework'),
('en', 'new_carer.review_framework_intro', 'At each review, work through these four questions:'),
('en', 'new_carer.review_fw_q1', 'What has changed since the last review — in health, family, finances, or care setting?'),
('en', 'new_carer.review_fw_q2', 'What is no longer working well, and why?'),
('en', 'new_carer.review_fw_q3', 'What risks are increasing and need to be addressed before they become crises?'),
('en', 'new_carer.review_fw_q4', 'What decisions or changes need to be made now, and who is responsible for making them?'),
('en', 'new_carer.review_triggers_heading', 'What should trigger an unscheduled review'),
('en', 'new_carer.review_trigger_1', 'A significant change in health or cognitive status'),
('en', 'new_carer.review_trigger_2', 'A hospitalisation or major medical event'),
('en', 'new_carer.review_trigger_3', 'A change in living arrangement or care provider'),
('en', 'new_carer.review_trigger_4', 'A significant change in family capacity or availability'),
('en', 'new_carer.review_trigger_5', 'Signs that the current arrangement is under serious strain'),
('en', 'new_carer.review_callout', 'The goal is not perfection. The goal is a workable plan that is honest, shared, and regularly reviewed.'),
('en', 'new_carer.review_questions_heading', 'Questions to think through'),
('en', 'new_carer.review_q1', 'Has a review schedule been agreed and communicated to everyone involved?'),
('en', 'new_carer.review_q2', 'Who is responsible for calling a review when a trigger event occurs?'),
('en', 'new_carer.review_q3', 'Is the care plan documented somewhere accessible, so that reviews can refer back to it?'),
('en', 'new_carer.review_q4', 'Are family members who are not the primary carer included in review conversations?'),

-- =========================================================
-- WORKSHEET RESOURCE CARDS
-- =========================================================
('en', 'new_carer.ws_home_safety_title', 'Home Safety Checklist'),
('en', 'new_carer.ws_home_safety_desc', 'A structured checklist for assessing safety risks in the home — fall hazards, accessibility, medication storage, and emergency access.'),
('en', 'new_carer.ws_home_safety_tag', 'Safety'),
('en', 'new_carer.ws_coordinating_title', 'Coordinating Caregiving Responsibilities'),
('en', 'new_carer.ws_coordinating_desc', 'A worksheet for mapping who does what across the caring team — useful for family meetings and getting responsibilities out of default mode.'),
('en', 'new_carer.ws_coordinating_tag', 'Coordination'),
('en', 'new_carer.ws_medications_title', 'Managing Medications and Supplements'),
('en', 'new_carer.ws_medications_desc', 'A template for recording current medications, dosages, prescribing clinicians, and administration instructions.'),
('en', 'new_carer.ws_medications_tag', 'Medication'),
('en', 'new_carer.ws_moving_in_title', 'Questions To Consider Before Moving an Older Adult Into Your Home'),
('en', 'new_carer.ws_moving_in_desc', 'A planning worksheet to think through the full implications of a family member moving in — beyond goodwill and good intentions.'),
('en', 'new_carer.ws_moving_in_tag', 'Housing'),
('en', 'new_carer.ws_documents_title', 'Important Documents and Paperwork'),
('en', 'new_carer.ws_documents_desc', 'A reference sheet for tracking the location of key documents — legal, financial, medical, and personal — and who has access.'),
('en', 'new_carer.ws_documents_tag', 'Documents'),
('en', 'new_carer.ws_view_worksheet', 'View worksheet'),
('en', 'new_carer.ws_coming_soon', 'Coming soon'),
('en', 'new_carer.ws_all_heading', 'Supporting worksheets'),
('en', 'new_carer.ws_all_intro', 'These practical worksheets complement the planning modules. Use them as structured thinking tools alongside each section.')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
