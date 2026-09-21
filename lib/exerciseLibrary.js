// Static exercise + routine index. Not an API — same shape a future Firestore-backed
// "custom exercise" would need to match (bodyPart, movement, equipment).

export const bodyParts = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core']
export const movements = ['Push', 'Pull', 'Hinge', 'Squat', 'Isolation']
export const equipmentTypes = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight']

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
