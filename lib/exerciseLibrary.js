// Static exercise + routine index. Not an API — same shape a future Firestore-backed
// "custom exercise" would need to match (bodyPart, movement, equipment).

export const bodyParts = ['Chest', 'Back', 'Upper Back', 'Lower Back', 'Shoulders', 'Arms', 'Biceps', 'Triceps', 'Forearms', 'Legs', 'Quads', 'Hamstrings', 'Glutes', 'Core', 'Abs', 'Neck']
export const movements = ['Push', 'Pull', 'Hinge', 'Squat', 'Isolation']
export const equipmentTypes = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Bands', 'EZ Bar', 'Exercise Ball', 'Medicine Ball', 'Foam Roller', 'Other']

export const exercises = [
  { id: 'barbell-bench-press', name: 'Barbell Bench Press', bodyPart: 'Chest', movement: 'Push', equipment: 'Barbell', category: 'Compound', description: 'A flat barbell press through the full chest range. The primary horizontal push and the most common lift for tracking upper-body strength over time.', steps: ['Set your grip just wider than shoulder width, wrists stacked over elbows.', 'Pull the shoulder blades back and down into the bench.', 'Lower to the lower chest under control, elbows around 45°.', 'Press back up and slightly toward the face. Keep the feet planted.'] },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', bodyPart: 'Chest', movement: 'Push', equipment: 'Dumbbell', category: 'Compound', description: 'A 30-45° incline press that shifts emphasis to the upper chest while allowing a longer, joint-friendly range of motion than a barbell.', steps: ['Set the bench to a 30-45° incline.', 'Press the dumbbells up and slightly inward until they nearly touch.', 'Lower under control until the elbows sit just below the bench line.'] },
  { id: 'cable-fly', name: 'Cable Fly', bodyPart: 'Chest', movement: 'Isolation', equipment: 'Cable', category: 'Isolation', description: 'A constant-tension isolation move for the chest, useful for finishing volume without taxing the shoulders like a heavy press.', steps: ['Set both pulleys roughly chest height.', 'Step forward with a slight forward lean and soft elbow bend.', 'Bring the handles together in a wide arc, squeezing the chest at the midline.'] },
  { id: 'dips', name: 'Dips', bodyPart: 'Chest', movement: 'Push', equipment: 'Bodyweight', category: 'Compound', description: 'A bodyweight push that loads the lower chest and triceps hard. Lean forward to bias the chest, stay upright to bias the triceps.', steps: ['Support your body on the bars with arms locked out.', 'Lower under control until the shoulders dip below the elbows.', 'Press back up without shrugging the shoulders toward the ears.'] },
  { id: 'machine-chest-press', name: 'Machine Chest Press', bodyPart: 'Chest', movement: 'Push', equipment: 'Machine', category: 'Compound', description: 'A fixed-path press useful for pushing close to failure safely, or as a lower-fatigue substitute for barbell pressing.', steps: ['Set the seat so the handles line up with mid-chest.', 'Press away from the body without locking the elbows hard.', 'Return under control to a full stretch.'] },
  { id: 'decline-bench-press', name: 'Decline Bench Press', bodyPart: 'Chest', movement: 'Push', equipment: 'Barbell', category: 'Compound', description: 'A downward-angled press that emphasises the lower chest fibres and typically allows the heaviest load of the pressing variations.', steps: ['Secure the legs and set a slight decline.', 'Lower the bar to the lower chest.', 'Press back up and slightly back toward the rack.'] },

  { id: 'barbell-row', name: 'Barbell Row', bodyPart: 'Back', movement: 'Pull', equipment: 'Barbell', category: 'Compound', description: 'A horizontal pull that builds back thickness. Keep the torso angle steady and pull to the lower ribs.', steps: ['Hinge forward to roughly 45°, spine neutral.', 'Pull the bar to the lower ribs, elbows tracking back.', 'Lower under control without losing the hinge.'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', bodyPart: 'Back', movement: 'Pull', equipment: 'Cable', category: 'Compound', description: 'A vertical pull that builds width, and a useful pull-up regression while building toward one.', steps: ['Set the thigh pads and take a slightly wider than shoulder grip.', 'Pull the bar to the upper chest, driving the elbows down and back.', 'Return to a full stretch without shrugging.'] },
  { id: 'deadlift', name: 'Deadlift', bodyPart: 'Back', movement: 'Hinge', equipment: 'Barbell', category: 'Compound', description: 'The full posterior chain hinge. Loads the back, glutes and hamstrings more than any other single lift.', steps: ['Set up with the bar over mid-foot, shins close to the bar.', 'Brace, flatten the back, and drive the floor away.', 'Finish with hips through, then reverse the same path down.'] },
  { id: 'seated-cable-row', name: 'Seated Cable Row', bodyPart: 'Back', movement: 'Pull', equipment: 'Cable', category: 'Compound', description: 'A horizontal pull with constant tension, easier to control through fatigue than a free-weight row.', steps: ['Sit tall with a slight forward lean at the stretch.', 'Pull the handle to the stomach, squeezing the shoulder blades together.', 'Return with control, allowing a full stretch forward.'] },
  { id: 'pull-up', name: 'Pull-Up', bodyPart: 'Back', movement: 'Pull', equipment: 'Bodyweight', category: 'Compound', description: 'A vertical bodyweight pull and one of the clearest strength benchmarks for the back and biceps.', steps: ['Hang from the bar with a full stretch.', 'Pull until the chin clears the bar, elbows driving down.', 'Lower under control to a dead hang.'] },

  { id: 'overhead-press', name: 'Overhead Press', bodyPart: 'Shoulders', movement: 'Push', equipment: 'Barbell', category: 'Compound', description: 'A standing vertical press that builds shoulder and triceps strength while demanding total-body bracing.', steps: ['Grip just outside shoulder width, bar resting on the front delts.', 'Brace the core and press straight up, tucking the head through at the top.', 'Lower under control back to the shoulders.'] },
  { id: 'lateral-raise', name: 'Lateral Raise', bodyPart: 'Shoulders', movement: 'Isolation', equipment: 'Dumbbell', category: 'Isolation', description: 'An isolation move for the side delts, the main driver of shoulder width.', steps: ['Stand with a soft bend in the elbows.', 'Raise the arms out to the sides to roughly shoulder height.', 'Lower slowly, resisting the negative.'] },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', bodyPart: 'Shoulders', movement: 'Pull', equipment: 'Machine', category: 'Isolation', description: 'Targets the rear delts directly, an area most pressing and pulling movements under-train.', steps: ['Sit chest-first against the pad.', 'Raise the arms out and back, squeezing the shoulder blades.', 'Return under control without swinging.'] },
  { id: 'cable-face-pull', name: 'Cable Face Pull', bodyPart: 'Shoulders', movement: 'Pull', equipment: 'Cable', category: 'Isolation', description: 'A high-rep rear delt and upper back move that also supports shoulder health.', steps: ['Set the pulley to face height.', 'Pull toward the face, splitting the rope around the ears.', 'Externally rotate at the end range, then return slowly.'] },
  { id: 'front-raise', name: 'Front Raise', bodyPart: 'Shoulders', movement: 'Isolation', equipment: 'Dumbbell', category: 'Isolation', description: 'Isolates the front delts, useful accessory volume alongside pressing work.', steps: ['Hold the dumbbells in front of the thighs.', 'Raise to shoulder height with a soft elbow bend.', 'Lower under control.'] },

  { id: 'barbell-curl', name: 'Barbell Curl', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Barbell', category: 'Isolation', description: 'The classic mass-builder for the biceps, allowing the heaviest load of the curl variations.', steps: ['Stand tall, elbows pinned to the sides.', 'Curl the bar up without swinging the hips.', 'Lower under control to a full stretch.'] },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', bodyPart: 'Arms', movement: 'Push', equipment: 'Barbell', category: 'Compound', description: 'A narrow-grip press that shifts emphasis onto the triceps while still allowing a heavy compound load.', steps: ['Grip just inside shoulder width.', 'Lower the bar to the lower chest, elbows tucked.', 'Press up, focusing on triceps lockout.'] },
  { id: 'incline-dumbbell-curl', name: 'Incline Dumbbell Curl', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Dumbbell', category: 'Isolation', description: 'The incline angle stretches the biceps at the bottom, adding range beyond a standing curl.', steps: ['Sit back on an incline bench, arms hanging straight down.', 'Curl without letting the elbows drift forward.', 'Lower to a full stretch.'] },
  { id: 'skull-crusher', name: 'Skull Crusher', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Barbell', category: 'Isolation', description: 'A lying triceps extension that loads the long head hard through a full stretch.', steps: ['Lie back with the bar over the chest, elbows pointed at the ceiling.', 'Lower the bar toward the forehead, elbows staying still.', 'Extend back up without flaring the elbows.'] },
  { id: 'concentration-curl', name: 'Concentration Curl', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Dumbbell', category: 'Isolation', description: 'A single-arm curl braced against the leg, useful for isolating the biceps without momentum.', steps: ['Brace the elbow against the inner thigh.', 'Curl with a strict, slow tempo.', 'Lower to a full stretch each rep.'] },
  { id: 'rope-pushdown', name: 'Rope Pushdown', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Cable', category: 'Isolation', description: 'A cable triceps finisher that lets the hands split apart at the bottom for a strong peak contraction.', steps: ['Keep the elbows pinned to the sides.', 'Push the rope down and split the ends apart at the bottom.', 'Return under control to a stretch.'] },

  { id: 'barbell-squat', name: 'Barbell Squat', bodyPart: 'Legs', movement: 'Squat', equipment: 'Barbell', category: 'Compound', description: 'The primary lower-body compound lift, loading the quads, glutes and core together.', steps: ['Set the bar across the upper back, brace hard.', 'Sit down and back, keeping the chest tall.', 'Drive through the floor back to standing.'] },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', bodyPart: 'Legs', movement: 'Hinge', equipment: 'Barbell', category: 'Compound', description: 'A hip-hinge variation that targets the hamstrings and glutes with a controlled stretch under load.', steps: ['Start standing, bar at the thighs.', 'Push the hips back, bar sliding down the legs.', 'Stop just below the knee, then drive the hips forward.'] },
  { id: 'leg-press', name: 'Leg Press', bodyPart: 'Legs', movement: 'Squat', equipment: 'Machine', category: 'Compound', description: 'A machine squat pattern that allows heavy quad and glute loading with less spinal demand.', steps: ['Set feet shoulder width on the platform.', 'Lower until the knees reach roughly 90°.', 'Press back up without locking the knees hard.'] },
  { id: 'leg-extension', name: 'Leg Extension', bodyPart: 'Legs', movement: 'Isolation', equipment: 'Machine', category: 'Isolation', description: 'Isolates the quads directly, useful for finishing leg volume after compound work.', steps: ['Set the pad just above the ankle.', 'Extend the knees to full lockout.', 'Lower under control to a full stretch.'] },
  { id: 'calf-raise', name: 'Calf Raise', bodyPart: 'Legs', movement: 'Isolation', equipment: 'Machine', category: 'Isolation', description: 'A high-rep isolation move for the calves, best trained with a full stretch and pause at the top.', steps: ['Set the balls of the feet on the platform edge.', 'Lower into a full stretch at the ankle.', 'Rise onto the toes and pause briefly.'] },

  { id: 'plank', name: 'Plank', bodyPart: 'Core', movement: 'Isolation', equipment: 'Bodyweight', category: 'Isolation', description: 'An anti-extension core hold that builds trunk stability for every other lift.', steps: ['Set the forearms and toes on the floor, body in a straight line.', 'Brace the core and glutes.', 'Hold without letting the hips sag or pike.'] },
  { id: 'cable-crunch', name: 'Cable Crunch', bodyPart: 'Core', movement: 'Isolation', equipment: 'Cable', category: 'Isolation', description: 'A loaded, kneeling ab crunch that allows progressive overload beyond bodyweight core work.', steps: ['Kneel below the pulley, rope behind the head.', 'Crunch down, rounding the spine toward the hips.', 'Return under control without losing tension.'] },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', bodyPart: 'Core', movement: 'Isolation', equipment: 'Bodyweight', category: 'Isolation', description: 'A demanding lower-ab move performed from a dead hang, scalable from bent knees to straight legs.', steps: ['Hang from the bar with the shoulders active.', 'Raise the legs by curling the hips up, not swinging.', 'Lower under control to a full hang.'] },

  { id: 'push-up', name: 'Push-Up', bodyPart: 'Chest', movement: 'Push', equipment: 'Bodyweight', category: 'Compound', description: 'The baseline bodyweight press. Scales easily with hand position, tempo or added load.', steps: ['Set hands just outside shoulder width, body in a straight line.', 'Lower the chest to just above the floor.', 'Press back up without letting the hips sag.'] },
  { id: 'pec-deck', name: 'Pec Deck Machine', bodyPart: 'Chest', movement: 'Isolation', equipment: 'Machine', category: 'Isolation', description: 'A fixed-path fly that isolates the chest with minimal shoulder strain.', steps: ['Set the pads level with the chest.', 'Bring the arms together in front of the chest.', 'Return slowly to a full stretch.'] },

  { id: 't-bar-row', name: 'T-Bar Row', bodyPart: 'Back', movement: 'Pull', equipment: 'Barbell', category: 'Compound', description: 'A chest-supported or free-standing row that loads the mid-back heavily with a short, strict range.', steps: ['Hinge forward and grip the handles.', 'Row to the sternum, elbows close to the body.', 'Lower under control to a full stretch.'] },
  { id: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', bodyPart: 'Back', movement: 'Pull', equipment: 'Cable', category: 'Isolation', description: 'Isolates the lats with locked elbows, useful for feeling the lat contraction without arm involvement.', steps: ['Set the bar high, arms straight.', 'Pull the bar down to the thighs in an arc.', 'Return to the stretch without bending the elbows.'] },
  { id: 'single-arm-dumbbell-row', name: 'Single-Arm Dumbbell Row', bodyPart: 'Back', movement: 'Pull', equipment: 'Dumbbell', category: 'Compound', description: 'A unilateral row supported on a bench, allowing a longer stretch and easier form control than a barbell row.', steps: ['Support one knee and hand on a bench.', 'Row the dumbbell to the hip, elbow close to the body.', 'Lower to a full stretch under control.'] },

  { id: 'arnold-press', name: 'Arnold Press', bodyPart: 'Shoulders', movement: 'Push', equipment: 'Dumbbell', category: 'Compound', description: 'A rotating dumbbell press that works the front and side delts through an extended range.', steps: ['Start with palms facing you at shoulder height.', 'Press up while rotating the palms to face forward.', 'Reverse the rotation on the way down.'] },
  { id: 'upright-row', name: 'Upright Row', bodyPart: 'Shoulders', movement: 'Pull', equipment: 'Barbell', category: 'Compound', description: 'A vertical pull that targets the side delts and traps together.', steps: ['Grip just inside shoulder width.', 'Pull the bar up close to the body to chest height.', 'Lower under control.'] },
  { id: 'shrug', name: 'Shrug', bodyPart: 'Shoulders', movement: 'Isolation', equipment: 'Barbell', category: 'Isolation', description: 'A direct trap builder, done by elevating the shoulders straight up under load.', steps: ['Hold the bar or dumbbells at the sides.', 'Elevate the shoulders straight up toward the ears.', 'Lower under control without rolling the shoulders.'] },

  { id: 'hammer-curl', name: 'Hammer Curl', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Dumbbell', category: 'Isolation', description: 'A neutral-grip curl that shifts emphasis onto the brachialis and forearm alongside the biceps.', steps: ['Hold the dumbbells with palms facing in.', 'Curl straight up without rotating the wrist.', 'Lower under control.'] },
  { id: 'ez-bar-curl', name: 'EZ-Bar Curl', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Barbell', category: 'Isolation', description: 'The angled grip of an EZ-bar reduces wrist strain while still allowing a heavy biceps curl.', steps: ['Grip the angled bar at the inner bend.', 'Curl up without swinging the elbows forward.', 'Lower to a full stretch.'] },
  { id: 'overhead-triceps-extension', name: 'Overhead Triceps Extension', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Dumbbell', category: 'Isolation', description: 'An overhead position that stretches the long head of the triceps harder than a pushdown.', steps: ['Hold one dumbbell overhead with both hands.', 'Lower behind the head, elbows pointing forward.', 'Extend back to full lockout.'] },
  { id: 'diamond-push-up', name: 'Diamond Push-Up', bodyPart: 'Arms', movement: 'Push', equipment: 'Bodyweight', category: 'Compound', description: 'A close-hand push-up variation that shifts most of the load onto the triceps.', steps: ['Form a diamond shape with the hands under the chest.', 'Lower with the elbows tracking back, not out.', 'Press back up to lockout.'] },
  { id: 'preacher-curl', name: 'Preacher Curl', bodyPart: 'Arms', movement: 'Isolation', equipment: 'Barbell', category: 'Isolation', description: 'The preacher bench removes momentum entirely, isolating the biceps through a strict range.', steps: ['Rest the upper arms flat on the preacher pad.', 'Curl up without letting the elbows lift off the pad.', 'Lower to a full stretch under control.'] },

  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', bodyPart: 'Legs', movement: 'Squat', equipment: 'Dumbbell', category: 'Compound', description: 'A rear-foot-elevated single-leg squat that builds quad and glute strength while exposing side-to-side imbalances.', steps: ['Rest the rear foot on a bench behind you.', 'Lower straight down until the front thigh is near parallel.', 'Drive through the front foot back to standing.'] },
  { id: 'walking-lunge', name: 'Walking Lunge', bodyPart: 'Legs', movement: 'Squat', equipment: 'Dumbbell', category: 'Compound', description: 'A moving lunge pattern that builds single-leg strength and balance under load.', steps: ['Step forward into a lunge, back knee toward the floor.', 'Drive through the front foot to stand and step through.', 'Repeat on the opposite leg, alternating each step.'] },
  { id: 'hip-thrust', name: 'Hip Thrust', bodyPart: 'Legs', movement: 'Hinge', equipment: 'Barbell', category: 'Compound', description: 'The most direct glute-loading movement, performed with the shoulders braced on a bench.', steps: ['Set the upper back against a bench, bar over the hips.', 'Drive the hips up until the torso is flat.', 'Lower under control without resting between reps.'] },
  { id: 'seated-leg-curl', name: 'Seated Leg Curl', bodyPart: 'Legs', movement: 'Isolation', equipment: 'Machine', category: 'Isolation', description: 'Isolates the hamstrings directly, a useful complement to hinge-pattern compound work.', steps: ['Set the pad just above the ankle, knees at the pivot.', 'Curl the legs down against the pad.', 'Return under control to a full stretch.'] },
  { id: 'goblet-squat', name: 'Goblet Squat', bodyPart: 'Legs', movement: 'Squat', equipment: 'Dumbbell', category: 'Compound', description: 'A front-loaded squat that reinforces an upright torso, often used to teach the squat pattern.', steps: ['Hold a dumbbell vertically at the chest.', 'Squat down between the knees, staying upright.', 'Drive back up through the whole foot.'] },

  { id: 'russian-twist', name: 'Russian Twist', bodyPart: 'Core', movement: 'Isolation', equipment: 'Bodyweight', category: 'Isolation', description: 'A rotational core move that targets the obliques, scalable with a plate or medicine ball.', steps: ['Sit with the torso leaned back and feet lifted or grounded.', 'Rotate the torso to touch each side of the floor.', 'Keep the movement controlled, not flung.'] },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', bodyPart: 'Core', movement: 'Isolation', equipment: 'Bodyweight', category: 'Isolation', description: 'A demanding anti-extension move that loads the entire core through a long lever arm.', steps: ['Kneel and grip the wheel under the shoulders.', 'Roll forward as far as control allows, keeping the back flat.', 'Pull back to the start using the abs, not the hips.'] },
  { id: 'side-plank', name: 'Side Plank', bodyPart: 'Core', movement: 'Isolation', equipment: 'Bodyweight', category: 'Isolation', description: 'An anti-lateral-flexion hold that targets the obliques and deep core stabilisers.', steps: ['Stack the feet and prop up on one forearm.', 'Lift the hips into a straight line.', 'Hold without letting the hips sag toward the floor.'] },

// --- Imported from megaGymDataset.csv (top-rated cut, see scripts/import-exercises.cjs) ---
  { id: 'rickshaw-carry', name: 'Rickshaw Carry', bodyPart: 'Forearms', movement: 'Isolation', equipment: 'Other', category: 'Strongman', level: 'Beginner', rating: 9.6, description: '' },
  { id: 'single-leg-press', name: 'Single-Leg Press', bodyPart: 'Quads', movement: 'Push', equipment: 'Machine', category: 'Strength', level: 'Intermediate', rating: 9.6, description: 'The single-leg leg press is an exercise targeting the quadriceps one leg at a time. Many lifters prefer the leg press to squatting for several reasons, including the perception that it’s safer for the spine.' },
  { id: 'landmine-twist', name: 'Landmine Twist', bodyPart: 'Abs', movement: 'Isolation', equipment: 'Other', category: 'Strength', level: 'Intermediate', rating: 9.5, description: 'The landmine twist is a rotational abdominal movement performed using an angled barbell anchored at floor level in a landmine device. It can also be performed by sticking a barbell in the corner of a room, preferably in a towel to protect the walls. It targets the deep muscles of the core, including both the obliques and the transversus abdominis. It can be done fast or slow, for time or reps, either in traditional muscle-focused rep ranges such as 8-12 reps per side or for higher rep ranges.' },
  { id: 'incline-hammer-curls', name: 'Incline Hammer Curls', bodyPart: 'Biceps', movement: 'Pull', equipment: 'Dumbbell', category: 'Strength', level: 'Beginner', rating: 9.5, description: '' },
  { id: 'palms-down-wrist-curl-over-bench', name: 'Palms-Down Wrist Curl over Bench', bodyPart: 'Forearms', movement: 'Pull', equipment: 'Barbell', category: 'Strength', level: 'Intermediate', rating: 9.5, description: 'The palms-down wrist curl over bench is an exercise targeting the forearms. It is usually performed for high reps, such as 10-15 reps per set or more, as part of a grip or arm-focused workout.' },
  { id: 'atlas-stones', name: 'Atlas Stones', bodyPart: 'Lower Back', movement: 'Isolation', equipment: 'Other', category: 'Strongman', level: 'Intermediate', rating: 9.5, description: '' },
  { id: 't-bar-row-with-handle', name: 'T-Bar Row with Handle', bodyPart: 'Upper Back', movement: 'Pull', equipment: 'Other', category: 'Strength', level: 'Intermediate', rating: 9.5, description: '' },
  { id: 'clean-from-blocks', name: 'Clean from Blocks', bodyPart: 'Quads', movement: 'Pull', equipment: 'Barbell', category: 'Olympic Weightlifting', level: 'Beginner', rating: 9.5, description: '' },
  { id: 'dumbbell-front-raise-to-lateral-raise', name: 'Dumbbell Front Raise to Lateral Raise', bodyPart: 'Shoulders', movement: 'Isolation', equipment: 'Dumbbell', category: 'Strength', level: 'Intermediate', rating: 9.5, description: 'The dumbbell front raise to lateral raise is a dumbbell complex that combines two exercises that build and strengthen the middle deltoids and the anterior deltoids of the shoulders. It is usually performed one rep of each movement at a time, although you could perform more reps of each, or increase the reps in successive rounds (e.g., 1 rep in round 1, 2 reps in round 2, etc.). No matter how you perform it, it targets both the anterior and medial deltoids, making it a great time-efficient shoulder burnout or accessory movement on an upper-body day.' },
  { id: 'palms-up-wrist-curl-over-bench', name: 'Palms-Up Wrist Curl over Bench', bodyPart: 'Forearms', movement: 'Pull', equipment: 'Barbell', category: 'Strength', level: 'Intermediate', rating: 9.4, description: 'The palms-up wrist curl over bench is an exercise targeting the forearms. It is usually performed for high reps, such as 10-15 reps per set or more, as part of a grip or arm-focused workout.' },
  { id: 'dumbbell-farmer-s-walk', name: 'Dumbbell Farmer\'s Walk', bodyPart: 'Forearms', movement: 'Isolation', equipment: 'Other', category: 'Strongman', level: 'Intermediate', rating: 9.4, description: 'The dumbbell farmer\'s walk is an exercise with roots in competitive strongman training, but which is also popular in CrossFit and functional training. It can be a challenging finisher to any workout, or work well in fat-loss circuit training or as an accessory movement to heavy lifts like the deadlift.' },
  { id: 'barbell-glute-bridge', name: 'Barbell Glute Bridge', bodyPart: 'Glutes', movement: 'Isolation', equipment: 'Barbell', category: 'Powerlifting', level: 'Intermediate', rating: 9.4, description: 'The barbell glute bridge is a popular exercise targeting the muscles of the glutes and hamstrings. It can be done as a strength movement on its own, as an activation drill or warm-up for lower-body training, or as a burnout at the end of a lower-body workout.' },
  { id: 'clean-deadlift', name: 'Clean Deadlift', bodyPart: 'Hamstrings', movement: 'Hinge', equipment: 'Barbell', category: 'Olympic Weightlifting', level: 'Beginner', rating: 9.4, description: '' },
  { id: 'romanian-deadlift-with-dumbbells', name: 'Romanian Deadlift with Dumbbells', bodyPart: 'Hamstrings', movement: 'Hinge', equipment: 'Dumbbell', category: 'Strength', level: 'Beginner', rating: 9.4, description: 'The dumbbell stiff-legged deadlift targets the hamstrings, glutes, low and upper back, as well as the core. The purpose of the stiff-legged, as opposed to Romanian deadlift with slightly bent knees, is to engage the hamstrings and low back to an even greater degree.' },
  { id: 'barbell-deficit-deadlift', name: 'Barbell Deficit Deadlift', bodyPart: 'Lower Back', movement: 'Hinge', equipment: 'Barbell', category: 'Powerlifting', level: 'Beginner', rating: 9.4, description: 'The barbell deficit deadlift is a compound exercise targeting the posterior chain. It is commonly utilized in powerlifting training to build pulling strength off the floor, but is also an effective muscle-building movement for the glutes and hamstrings. It is usually performed with lighter weight, and perhaps for higher reps, than traditional deadlifts. If these make your back sore, decrease the deficit and/or wear a weightlifting belt.' },
  { id: 'tire-flip', name: 'Tire Flip', bodyPart: 'Quads', movement: 'Isolation', equipment: 'Other', category: 'Strongman', level: 'Intermediate', rating: 9.4, description: 'The tire flip is an exercise that works the entire body, starting from a deadlift position and ending with a giant tire being flipped over. Each flip moves the tire farther in one direction until a set has been completed. It can be performed for time or reps as part of a functional fitness or athleticism-focused workout.' },
  { id: 'clean-and-press', name: 'Clean and Press', bodyPart: 'Shoulders', movement: 'Push', equipment: 'Barbell', category: 'Strength', level: 'Intermediate', rating: 9.4, description: 'The clean and press is a full-body lift comprised of two movements: the clean, where the bar is pulled from the floor and caught in the front rack position in three pulls or phases, followed by the overhead press. Decades ago, it was contested in the Olympics. Today, it remains a worthy centerpiece of a power and strength training program, and has full-body benefits when done for low reps as well as moderate to high reps.' },
  { id: 'single-arm-palm-in-dumbbell-shoulder-press', name: 'Single-Arm Palm-In Dumbbell Shoulder Press', bodyPart: 'Shoulders', movement: 'Push', equipment: 'Dumbbell', category: 'Strength', level: 'Intermediate', rating: 9.4, description: 'The single-arm palm-in dumbbell shoulder press builds the shoulder muscles but with two major differences from the standard dumbbell shoulder press. It\'s done one arm at a time and the wrist stays neutral throughout the movement. It can be performed standing or seated. A single dumbbell press can be pursued as a strength goal, or trained in traditional muscle-building rep ranges such as 8-15 reps per set or more.' },
  { id: 'triceps-dip', name: 'Triceps Dip', bodyPart: 'Triceps', movement: 'Push', equipment: 'Bodyweight', category: 'Strength', level: 'Intermediate', rating: 9.4, description: 'The triceps dip is a bodyweight exercise performed on parallel bars or on a pull-up and dip station. It targets the triceps first, but also stretches and strengthens the chest and shoulders. Dips with a triceps focus are usually performed with an upright torso, the knees bent and crossed, and the arms close to the body. Dips can be performed for low reps for strength or higher reps for muscle growth.' },
  { id: 'dumbbell-v-sit-cross-jab', name: 'Dumbbell V-Sit Cross Jab', bodyPart: 'Abs', movement: 'Isolation', equipment: 'Dumbbell', category: 'Strength', level: 'Intermediate', rating: 9.3, description: 'The dumbbell V-sit cross jab is a hybrid movement that trains the abdominal and shoulder muscles simultaneously. It can address multiple muscle groups in a time-efficient muscle-building or circuit-style workout, while also providing a cardiovascular challenge.' },
  { id: 'dumbbell-spell-caster', name: 'Dumbbell Spell Caster', bodyPart: 'Abs', movement: 'Isolation', equipment: 'Dumbbell', category: 'Strength', level: 'Beginner', rating: 9.3, description: 'The dumbbell spell caster is an exercise that primarily targets the abdominal muscles such as the obliques. However, it also works shoulders, back, hips, and legs, and demands all of those muscles work together in a coordinated motion. It is usually performed with relatively light weights for moderate to high reps, at least 8-12 reps per side. Make sure to only use a weight you can control.' },
  { id: 'suspended-ab-fall-out', name: 'Suspended Ab Fall-Out', bodyPart: 'Abs', movement: 'Isolation', equipment: 'Other', category: 'Strength', level: 'Intermediate', rating: 9.3, description: 'The suspended ab fall-out is a dynamic abdominal exercise utilizing a suspension strap system or gymnastic rings. It is similar in form to an ab roller, but can more easily be scaled to be more or less difficult. It targets the muscles of the rectus abdominis or "six-pack" muscles, as well as the deep core muscles. It can be trained for low reps for strength or higher reps for muscle definition.' },
  { id: 'standing-cable-low-to-high-twist', name: 'Standing Cable Low-To-High Twist', bodyPart: 'Abs', movement: 'Isolation', equipment: 'Cable', category: 'Strength', level: 'Intermediate', rating: 9.3, description: 'The standing cable low-to-high twist is a core exercise targeting the upper abdominals and the obliques. Take care to perform it with control, as opposed to violent twisting which can injure the back. It is usually performed for moderate to high reps, at least 8-15 per side, as part of the core-focused portion of a workout.' },
  { id: 'elbow-plank', name: 'Elbow Plank', bodyPart: 'Abs', movement: 'Isolation', equipment: 'Bodyweight', category: 'Strength', level: 'Intermediate', rating: 9.3, description: 'The elbow plank is a popular isometric abdominal exercise. It is common in all types of exercise programs, as well as in group fitness and yoga classes. It targets the muscles of the core, the deep core or transversus abdominis in particular. It is also often prescribed for time to help back pain or to teach proper bracing.' },
  { id: 'bottoms-up', name: 'Bottoms Up', bodyPart: 'Abs', movement: 'Isolation', equipment: 'Bodyweight', category: 'Strength', level: 'Intermediate', rating: 9.3, description: 'The lying leg lift is a popular bodyweight exercise targeting the muscles of the abs, the rectus abdominis or “six-pack” muscles in particular. It can be performed for time or reps in the core-focused portion of any workout.' },
  { id: 'wide-grip-barbell-curl', name: 'Wide-Grip Barbell Curl', bodyPart: 'Biceps', movement: 'Pull', equipment: 'Barbell', category: 'Strength', level: 'Beginner', rating: 9.3, description: 'The wide-grip barbell curl is a variation of the classic barbell curl with the grip wider than shoulder width. It is thought that this helps build the inner or "short" head of the biceps muscles. This movement is usually performed for moderate to high reps, such as 8-12 reps per set.' },
  { id: 'standing-behind-the-back-wrist-curl', name: 'Standing Behind-The-Back Wrist Curl', bodyPart: 'Forearms', movement: 'Pull', equipment: 'Barbell', category: 'Strength', level: 'Beginner', rating: 9.3, description: 'The standing behind-the-back wrist curl is a popular exercise to target the muscles in the forearms, wrists, and fingers. It is generally performed for moderate to high reps, such as 8-15 reps per set, and can work as isolated forearm training or as part of an arms-focused workout.' },
  { id: 'seated-finger-curl', name: 'Seated Finger Curl', bodyPart: 'Forearms', movement: 'Pull', equipment: 'Barbell', category: 'Strength', level: 'Beginner', rating: 9.3, description: 'The seated finger curl is an exercise targeting the muscles of the hands and forearms. It is popular with rock climbers and other athletes looking to build forearm size and strength. The range of motion is tiny, but done for moderate to high reps, these will definitely make the forearms burn.' },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', bodyPart: 'Hamstrings', movement: 'Hinge', equipment: 'Barbell', category: 'Powerlifting', level: 'Beginner', rating: 9.3, description: 'The sumo deadlift is a compound movement in which the feet are set in a wide stance with toes pointed out and grip is placed inside of the legs. It is allowed to be performed instead of conventional deadlifts in most powerlifting competitions. The sumo deadlift targets the hamstrings, glutes, and upper back/traps, but also has a greater emphasis on stretching and strengthening the adductor and hip muscles due to the wide stance.' },
  { id: 'lying-face-down-plate-neck-resistance', name: 'Lying Face Down Plate Neck Resistance', bodyPart: 'Neck', movement: 'Isolation', equipment: 'Other', category: 'Strength', level: 'Beginner', rating: 9.3, description: '' },
  { id: 'barbell-back-squat-to-box', name: 'Barbell Back Squat to Box', bodyPart: 'Quads', movement: 'Squat', equipment: 'Barbell', category: 'Powerlifting', level: 'Intermediate', rating: 9.3, description: 'The barbell back squat to box is a popular version of a classic lower-body exercise that utilizes a box at the bottom position of the movement. This allows the lifter to customize the depth of the squat, as well as limit the stretch reflex at the bottom of the squat. The movement targets the quadriceps, glutes, and hamstrings. The squat to box can be performed for low reps to build strength or power, or for higher reps to build muscle.' },
  { id: 'push-press', name: 'Push-Press', bodyPart: 'Quads', movement: 'Push', equipment: 'Barbell', category: 'Olympic Weightlifting', level: 'Intermediate', rating: 9.3, description: 'The push-press is an overhead press variation in which the barbell is pushed upward with assistance from the lower body. This "push" helps the weight travel through the sticking point of a strict press. The push-press is commonly performed as part of barbell complexes, power training for all types of athletics, or as a powerful shoulder exercise.' },
  { id: 'power-snatch', name: 'Power Snatch', bodyPart: 'Quads', movement: 'Pull', equipment: 'Barbell', category: 'Olympic Weightlifting', level: 'Expert', rating: 9.3, description: 'The power snatch is a full-body lift in which the bar is pulled from the floor with a wide grip to the overhead position in one movement. The bar is received in the "power" position, with the hips higher than a full-depth squat position. The power snatch can be used as a learning tool for the full snatch, or to train muscular power and strength on its own. It is usually performed for low reps, focusing on power and movement quality.' },
  { id: 'hang-clean', name: 'Hang Clean', bodyPart: 'Quads', movement: 'Pull', equipment: 'Barbell', category: 'Olympic Weightlifting', level: 'Beginner', rating: 9.3, description: '' },
  { id: 'clean-and-jerk', name: 'Clean and Jerk', bodyPart: 'Shoulders', movement: 'Push', equipment: 'Barbell', category: 'Olympic Weightlifting', level: 'Intermediate', rating: 9.3, description: 'The clean and jerk is a full-body lift that is one of two contested lifts in Olympic weightlifting competitions. It is comprised of two movements: the clean, where the bar is pulled from the floor and caught in the front rack position in three pulls or phases, followed by the jerk overhead. The clean and jerk hits every muscle from head to toe and can be the centerpiece of a lifting program. It is also popular in CrossFit and athletic training programs. It is usually performed in low rep ranges, focusing on power and movement quality.' },
  { id: 'military-press', name: 'Military Press', bodyPart: 'Shoulders', movement: 'Push', equipment: 'Barbell', category: 'Strength', level: 'Intermediate', rating: 9.3, description: 'The military press is a compound movement used to build size and strength in the shoulders. It was once contested as a fourth powerlift, but is rarely competed anymore. However, being able to press a significant weight overhead remains a popular marker of upper-body strength. The military press can be trained as a strength lift or in traditional muscle-building rep ranges as part of full-body, shoulder-focused, or upper-body training.' },
  { id: 'standing-palms-in-shoulder-press', name: 'Standing Palms-In Shoulder Press', bodyPart: 'Shoulders', movement: 'Push', equipment: 'Dumbbell', category: 'Strength', level: 'Intermediate', rating: 9.3, description: 'The standing palms-in shoulder press is a dumbbell exercise targeting the shoulders. It can be performed in strength-focused rep ranges, such as 5-8 reps per set, or for higher reps to build muscle or for conditioning.' },
  { id: 'dumbbell-floor-press', name: 'Dumbbell Floor Press', bodyPart: 'Triceps', movement: 'Push', equipment: 'Dumbbell', category: 'Powerlifting', level: 'Intermediate', rating: 9.3, description: 'The dumbbell floor press is a multijoint pressing exercise performed lying on the floor. It can be performed either with the knees bent or flat. The floor press limits the range of motion you would achieve with a regular dumbbell bench press, but still targets the chest, triceps, and anterior delts. This allows you to press more weight than in a dumbbell bench press, and perhaps put less stress on the shoulders.' },
  { id: 'decline-ez-bar-skullcrusher', name: 'Decline EZ-Bar Skullcrusher', bodyPart: 'Triceps', movement: 'Isolation', equipment: 'EZ Bar', category: 'Strength', level: 'Intermediate', rating: 9.3, description: 'The decline EZ-bar skullcrusher is a popular exercise targeting the triceps muscles. The angle of the bench creates a greater range of motion than flat bench skullcrushers, as well as targeting the lateral head of the muscle. This exercise is usually performed for moderate to high reps as part of an upper-body or arm-focused workout.' },
  { id: 'decline-reverse-crunch', name: 'Decline Reverse Crunch', bodyPart: 'Abs', movement: 'Isolation', equipment: 'Other', category: 'Strength', level: 'Intermediate', rating: 9.2, description: 'The decline reverse crunch is a popular bodyweight exercise targeting the abdominal muscles, particularly the lower abs. It is usually performed for high reps, such as 10-15 reps per set or more, as part of the ab-focused portion of a workout.' },
]

export function getExerciseById(id) {
  return exercises.find(exercise => exercise.id === id) || null
}

export function filterExercises(list, { search = '', filters = {} } = {}) {
  const term = search.trim().toLowerCase()
  const { bodyPart = [], movement = [], equipment = [] } = filters
  return list.filter(exercise => {
    if (term && !exercise.name.toLowerCase().includes(term)) return false
    if (bodyPart.length && !bodyPart.includes(exercise.bodyPart)) return false
    if (movement.length && !movement.includes(exercise.movement)) return false
    if (equipment.length && !equipment.includes(exercise.equipment)) return false
    return true
  })
}

// One library exercise, shaped to match the entries WorkoutDay/Exercise already expect.
// `libraryId` is what lets the library pages detect "already added to a day".
export function buildWorkoutExerciseEntry(libraryExercise, setCount = 3) {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: libraryExercise.name,
    libraryId: libraryExercise.id || null,
    isStarted: false,
    isCompleted: false,
    isCollapsed: false,
    markForIncrease: false,
    sets: Array.from({ length: setCount }, (_, index) => ({ setNumber: index + 1, previousWeight: 0, previousReps: 0, currentWeight: '', currentReps: '' })),
  }
}

const session = (name, focusLabel, items) => ({ name, focusLabel, exercises: items.map(([id, sets, reps]) => ({ id, sets, reps })) })

export const routines = [
  {
    id: 'arnies-bis-and-tris',
    name: "Arnie's Bi's and Tri's",
    tagline: 'A high-volume arm session alternating biceps and triceps. Three movements each, heaviest first.',
    bodyPart: 'Arms',
    estMinutes: 50,
    sessions: [
      session('Arnie\'s Bi\'s and Tri\'s', 'Arms', [
        ['barbell-curl', 4, '8-10'],
        ['close-grip-bench-press', 4, '8-10'],
        ['incline-dumbbell-curl', 3, '10-12'],
        ['skull-crusher', 3, '10-12'],
        ['concentration-curl', 3, '12'],
        ['rope-pushdown', 3, '12-15'],
      ]),
    ],
  },
  {
    id: 'frank-zane-shoulders',
    name: 'Frank Zane Shoulders',
    tagline: 'Classic-era shoulder volume built around presses and strict isolation for width and detail.',
    bodyPart: 'Shoulders',
    estMinutes: 45,
    sessions: [
      session('Frank Zane Shoulders', 'Shoulders', [
        ['overhead-press', 4, '8-10'],
        ['lateral-raise', 4, '12-15'],
        ['rear-delt-fly', 3, '12-15'],
        ['cable-face-pull', 3, '15'],
        ['front-raise', 3, '12-15'],
      ]),
    ],
  },
  {
    id: 'push-pull-legs',
    name: 'Push / Pull / Legs',
    tagline: 'The standard three-way split, three days a week.',
    bodyPart: 'Full body',
    estMinutes: 55,
    sessions: [
      session('Push', 'Chest, shoulders, triceps', [
        ['barbell-bench-press', 4, '8'],
        ['overhead-press', 4, '8'],
        ['incline-dumbbell-press', 3, '10'],
        ['lateral-raise', 3, '15'],
        ['rope-pushdown', 3, '12'],
      ]),
      session('Pull', 'Back, rear delts, biceps', [
        ['deadlift', 3, '5'],
        ['barbell-row', 4, '8'],
        ['lat-pulldown', 3, '10'],
        ['cable-face-pull', 3, '15'],
        ['barbell-curl', 3, '10'],
      ]),
      session('Legs', 'Quads, hamstrings, calves', [
        ['barbell-squat', 4, '6-8'],
        ['romanian-deadlift', 3, '8-10'],
        ['leg-press', 3, '10-12'],
        ['calf-raise', 4, '15'],
      ]),
    ],
  },
  {
    id: 'dorian-yates-back',
    name: 'Dorian Yates Back',
    tagline: 'Low-volume, high-intensity back work built around one hard working set per movement.',
    bodyPart: 'Back',
    estMinutes: 40,
    sessions: [
      session('Dorian Yates Back', 'Back', [
        ['deadlift', 2, '6-8'],
        ['barbell-row', 3, '8-10'],
        ['lat-pulldown', 3, '8-10'],
        ['seated-cable-row', 2, '10'],
        ['pull-up', 2, 'AMRAP'],
      ]),
    ],
  },
]

export function getRoutineById(id) {
  return routines.find(routine => routine.id === id) || null
}

export function routineExerciseCount(routine) {
  return routine.sessions.reduce((total, item) => total + item.exercises.length, 0)
}
