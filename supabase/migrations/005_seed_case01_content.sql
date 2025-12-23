-- Seed Case 01 Content: Scenes, Suspects, and Records
-- This migration populates the case_scenes, case_suspects, and case_records tables

-- First, get the case_id for case01 (we'll use it throughout)
DO $$
DECLARE
    v_case_id UUID;
BEGIN
    -- Get the case ID for case01
    SELECT id INTO v_case_id FROM public.cases WHERE slug = 'case01';
    
    IF v_case_id IS NULL THEN
        RAISE EXCEPTION 'Case01 not found. Please run migration 004 first.';
    END IF;
    
    -- Insert Scenes
    INSERT INTO public.case_scenes (case_id, scene_id, name, description, image_url, initial_availability, dp_cost)
    VALUES
        (v_case_id, 'scene_staircase', 'Grand Staircase (Private Wing)', 
         'The crime scene. Reginald''s body was found at the bottom of these marble stairs. A wine glass lay nearby, its dark contents spilled across the floor in a tight cluster.',
         '/cases/case01/images/scenes/staircase.png', TRUE, 3),
        
        (v_case_id, 'scene_greenhouse', 'Grand Conservatory (Greenhouse)',
         'Reginald''s pride and joy - a glass-domed greenhouse filled with rare orchids and tropical blooms. He personally led tours here during the afternoon.',
         '/cases/case01/images/scenes/greenhouse.png', TRUE, 3),
        
        (v_case_id, 'scene_lawn', 'Lawn & Terrace',
         'Where the afternoon luncheon was held. White canopies, champagne, and society''s polished conversation filled the space earlier that day.',
         '/cases/case01/images/scenes/north lawn.png', TRUE, 3),
        
        (v_case_id, 'scene_ballroom', 'Ballroom',
         'The grand ballroom where the evening''s charity presentation took place. Crystal chandeliers, live music, and dozens of guests filled the space.',
         '/cases/case01/images/scenes/ballroom.png', TRUE, 3),
        
        (v_case_id, 'scene_master_bedroom', 'Master Bedroom (Private Wing)',
         'Veronica and Reginald''s private quarters. Elegant and intimate, with a grand portrait on the wall and a piano bench where Veronica keeps sheet music.',
         '/cases/case01/images/scenes/bedroom.png', FALSE, 3),
        
        (v_case_id, 'scene_study', 'Reginald''s Study',
         'Reginald''s private office. A place of business and secrets. The study contains a safe where Reginald kept his most sensitive documents.',
         '/cases/case01/images/scenes/study.png', FALSE, 3)
    ON CONFLICT (case_id, scene_id) DO NOTHING;
    
    -- Insert Suspects
    INSERT INTO public.case_suspects (case_id, suspect_id, name, role, bio, portrait_url, initial_availability)
    VALUES
        (v_case_id, 'suspect_veronica', 'Veronica Ashcombe', 'The Widow',
         '62 years old, graceful and intelligent. Once a concert pianist, now manages the social and charitable side of Ashcombe Estate. Found Reginald''s body at the bottom of the grand staircase.',
         '/cases/case01/images/portraits/veronica.jpg', TRUE),
        
        (v_case_id, 'suspect_martin', 'Martin Ashcombe', 'The Irresponsible Brother',
         '61 years old, Reginald''s younger brother. Charming but financially dependent. Former academic who squandered opportunities through gambling. Was very drunk during the gala.',
         '/cases/case01/images/portraits/martin.jpg', FALSE),
        
        (v_case_id, 'suspect_colin', 'Colin Dorsey', 'The Estate Manager',
         '53 years old, Reginald''s right hand and estate manager. Competent and loyal on the surface. Responded to Veronica''s scream after the body was discovered.',
         '/cases/case01/images/portraits/colin.jpg', FALSE),
        
        (v_case_id, 'suspect_lydia', 'Lydia Portwell', 'The Charity Director',
         '51 years old, polished and ambitious. Oversees the Ashcombe Foundation''s fundraising campaigns. Was helping Veronica rehearse her speech when the murder occurred.',
         '/cases/case01/images/portraits/lydia.jpg', FALSE),
        
        (v_case_id, 'suspect_vale', 'Dr. Leonard Vale', 'The Physician',
         '58 years old, elegant and calculating. Longtime friend of the Ashcombe family and attending physician. Left the ballroom early for an ''urgent phone call'' before Reginald''s death.',
         '/cases/case01/images/portraits/vale.jpg', FALSE)
    ON CONFLICT (case_id, suspect_id) DO NOTHING;
    
    -- Insert Records
    INSERT INTO public.case_records (case_id, record_id, name, description, content, document_url, initial_availability, dp_cost)
    VALUES
        (v_case_id, 'record_coroner', 'Coroner''s Report',
         'Official autopsy and scene analysis. Rules the death as accidental.',
         E'CAUSE OF DEATH: Fatal skull fracture\n\nFINDINGS: Injury pattern consistent with fall from TOP of staircase. Single point of impact. No secondary bruising or defensive wounds.\n\nTOXICOLOGY: Alcohol present, within social drinking range.\n\nRULING: Accidental fall. No evidence of foul play.',
         NULL, TRUE, 2),
        
        (v_case_id, 'record_crime_scene_photos', 'Crime Scene Photographs',
         'Photos taken at the scene, including close-ups of the body, wine spill, and staircase.',
         NULL, '/cases/case01/images/documents/crime_photos.jpg', TRUE, 2),
        
        (v_case_id, 'record_gala_photos', 'Gala Event Photos',
         'Photos from the evening''s festivities, showing guests, staff, and the inner circle throughout the event.',
         NULL, '/cases/case01/images/documents/gala_photos.jpg', TRUE, 2),
        
        (v_case_id, 'record_blackmail_floor', 'Blackmail Papers (Found at Scene)',
         'Documents found scattered near Reginald''s body, collected by Veronica. Contains incriminating evidence on Martin, Lydia, and Colin - but Dr. Vale''s page is missing.',
         NULL, '/cases/case01/images/documents/blackmail_floor.jpg', FALSE, 2),
        
        (v_case_id, 'record_blackmail_portrait', 'Blackmail Papers (Behind Portrait)',
         'The complete original set of blackmail documents hidden behind a portrait in the master bedroom. Includes ALL pages, including Dr. Vale''s.',
         NULL, '/cases/case01/images/documents/blackmail_portrait.jpg', FALSE, 2),
        
        (v_case_id, 'record_phone_logs', 'Phone Records',
         'Estate phone logs from the evening of the gala, showing all incoming and outgoing calls.',
         NULL, NULL, FALSE, 2),
        
        (v_case_id, 'record_greenhouse_footage', 'Greenhouse Security Footage',
         'Automatically uploaded security camera footage from the greenhouse, timestamped during the gala.',
         NULL, '/cases/case01/images/documents/greenhouse_footage.jpg', FALSE, 2)
    ON CONFLICT (case_id, record_id) DO NOTHING;
    
END $$;









