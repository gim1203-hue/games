export const storyCampaigns = [
  {
    id: 'galaxy-war', number: '12', title: 'Galaxy War', subtitle: 'The Last Signal', category: 'SPACE SHOOTER', mark: 'GW', tone: 'moss', mode: 'shooter',
    description: 'Defend the frontier, break the blockade, and face the Armada flagship.',
    story: 'The Helios beacon has gone dark. Pilot Nova must reopen the star roads before the frontier colonies are cut off.',
    stages: [
      { name: 'Beacon Outpost', story: 'Scouts surround the silent beacon. Clear a path so its crew can relight the signal.', objective: 'Destroy 4 scout ships.', target: 4, enemyColor: 0xe2785b },
      { name: 'Red Nebula Run', story: 'The Armada is regrouping inside the nebula. Break through its escort before the route closes.', objective: 'Destroy 6 escort ships.', target: 6, enemyColor: 0xd49b4d },
      { name: 'Iron Crown', story: 'The flagship blocks the final gate. Aim carefully and bring the Iron Crown down.', objective: 'Defeat the flagship.', target: 1, boss: true, bossHits: 5, enemyColor: 0xc95e58 },
    ],
  },
  {
    id: 'clockwork-courier', number: '13', title: 'Clockwork Courier', subtitle: 'The Stopped City', category: 'PLATFORM ADVENTURE', mark: 'CC', tone: 'marigold', mode: 'platform',
    description: 'Carry the winding key through a city whose clocks have stopped.',
    story: 'A storm stopped every clock in Bellwether. Tavi must deliver the master spring to the hilltop tower before sundown.',
    stages: [
      { name: 'Brass Market', story: 'The market lifts are stuck between floors. Find the courier seals to open the east gate.', objective: 'Gather 4 courier seals and reach the gate.', target: 4 },
      { name: 'Pendulum Works', story: 'The factory is still moving, one gear at a time. Cross the machinery and recover the spring.', objective: 'Gather 5 winding cogs and reach the gate.', target: 5 },
      { name: 'Bellwether Tower', story: 'The master clock waits above the rooftops. Deliver the spring and start the city again.', objective: 'Gather 3 tower keys and reach the gate.', target: 3 },
    ],
  },
  {
    id: 'deep-signal', number: '14', title: 'Deep Signal', subtitle: 'The Sunken Archive', category: 'UNDERSEA MAZE', mark: 'DS', tone: 'moss', mode: 'maze',
    description: 'Guide a tiny sub through flooded halls to recover a lost archive.',
    story: 'A signal is pulsing beneath the old reef library. Sub-pilot Ren follows it down to retrieve the archive before the tide turns.',
    stages: [
      { name: 'Kelp Entry', story: 'The outer halls are tangled with kelp. Recover the three data pearls to unlock the next hatch.', objective: 'Collect every data pearl and reach the hatch.', target: 3 },
      { name: 'Silt Gallery', story: 'The gallery floor has shifted. Follow the marks left by the archive keepers.', objective: 'Collect every data pearl and reach the hatch.', target: 4 },
      { name: 'Pressure Vault', story: 'The signal comes from the sealed vault. Bring its final memory to the surface.', objective: 'Collect every data pearl and reach the hatch.', target: 5 },
    ],
  },
  {
    id: 'ember-escape', number: '15', title: 'Ember Escape', subtitle: 'The Ashen Pass', category: 'VOLCANO RUNNER', mark: 'EE', tone: 'coral', mode: 'runner',
    description: 'Race a mountain trail as the old volcano wakes beneath it.',
    story: 'The mountain is rumbling again. Scout Mira must carry the village warning through three passes before the ashfall arrives.',
    stages: [
      { name: 'Cinder Trail', story: 'Warm stones roll across the path. Keep moving and collect the signal flags.', objective: 'Reach the pass and collect 3 signal flags.', target: 3 },
      { name: 'Ashfall Ridge', story: 'The sky has turned orange. Duck the falling branches and find the ridge markers.', objective: 'Reach the ridge and collect 4 markers.', target: 4 },
      { name: 'Safehouse Run', story: 'The final shelter is just ahead. Carry the warning beacon all the way home.', objective: 'Reach the shelter and collect 5 beacon shards.', target: 5 },
    ],
  },
  {
    id: 'skybound-rescue', number: '16', title: 'Skybound Rescue', subtitle: 'The Cloud Isles', category: 'AERIAL RESCUE', mark: 'SR', tone: 'marigold', mode: 'flight',
    description: 'Fly between floating islands and rescue a lost research crew.',
    story: 'A drifting weather station has lost contact above the cloud sea. Pilot Sol follows its flare trail across the islands.',
    stages: [
      { name: 'Lower Thermals', story: 'Steer through restless updrafts and collect enough supply flares to spot the station.', objective: 'Collect 5 rescue flares.', target: 5 },
      { name: 'Thunder Shelf', story: 'The station is beyond a storm shelf. Gather its scattered beacon cells.', objective: 'Collect 6 beacon cells.', target: 6 },
      { name: 'High Cloud Station', story: 'The crew is ready to leave, but the launch beacon needs one final charge.', objective: 'Collect 7 charge crystals.', target: 7 },
    ],
  },
  {
    id: 'sandship-rally', number: '17', title: 'Sandship Rally', subtitle: 'The Glass Dunes', category: 'LANE DODGER', mark: 'SS', tone: 'coral', mode: 'lanes',
    description: 'Steer a sand skiff through a desert race to deliver a water map.',
    story: 'The wells are drying up. Niko races a skiff across the glass dunes with the only map to a hidden spring.',
    stages: [
      { name: 'Copper Flats', story: 'Rival skiffs have left debris in every lane. Dodge the wreckage and gather map scraps.', objective: 'Cross the flats and collect 5 map scraps.', target: 5 },
      { name: 'Mirror Canyon', story: 'Reflections hide the sharp turns. Find the route markers between the canyon walls.', objective: 'Cross the canyon and collect 6 route markers.', target: 6 },
      { name: 'The Hidden Spring', story: 'The spring is close. Bring enough water seals through the final race.', objective: 'Reach the spring and collect 7 water seals.', target: 7 },
    ],
  },
  {
    id: 'moon-garden', number: '18', title: 'Moon Garden', subtitle: 'The Night Seeds', category: 'LIGHT PUZZLE', mark: 'MG', tone: 'moss', mode: 'lights',
    description: 'Restore constellations of garden lamps before dawn reaches the moon.',
    story: 'The moon garden is dimming. Caretaker Luma must relight its constellations in the right order.',
    stages: [
      { name: 'Dew Courtyard', story: 'Switch the lamps until every sleeping flower can see the stars.', objective: 'Turn every lamp off.', scramble: [0, 4, 8, 1] },
      { name: 'Silver Greenhouse', story: 'The glasshouse has reflected the light into a harder pattern.', objective: 'Turn every lamp off.', scramble: [0, 4, 8, 1, 12, 3, 21] },
      { name: 'Moonwell', story: 'The last constellation is reflected in the well. Finish the pattern before sunrise.', objective: 'Turn every lamp off.', scramble: [0, 4, 8, 1, 12, 3, 21, 15, 7] },
    ],
  },
  {
    id: 'crystal-caverns', number: '19', title: 'Crystal Caverns', subtitle: 'The Echo Core', category: 'CAVE PLATFORMER', mark: 'CC', tone: 'moss', mode: 'platform',
    description: 'Cross echoing caves and return the core crystal to its chamber.',
    story: 'A tremor scattered the Echo Core through the caverns. Miner Iri follows its ringing fragments back underground.',
    stages: [
      { name: 'Singing Entrance', story: 'The entrance hums with loose crystal dust. Gather the fragments and find the lower ledge.', objective: 'Gather 4 crystals and reach the gate.', target: 4 },
      { name: 'Shiver Bridge', story: 'The bridge is cracked but still ringing. Collect its anchor crystals along the way.', objective: 'Gather 5 crystals and reach the gate.', target: 5 },
      { name: 'Echo Core Chamber', story: 'The last fragment rests beyond the deep fissure. Bring the core back together.', objective: 'Gather 6 crystals and reach the gate.', target: 6 },
    ],
  },
  {
    id: 'stormbreakers', number: '20', title: 'Stormbreakers', subtitle: 'The Signal Tower', category: 'DODGE & RESCUE', mark: 'SB', tone: 'coral', mode: 'dodge',
    description: 'Cross a storm zone and restore the coast’s warning beacons.',
    story: 'Three coastal beacons have gone dark. Mara pilots a rescue pod through the storm to relight them.',
    stages: [
      { name: 'Foam Line', story: 'The first beacon is buried in the spray. Recover its power cells while avoiding the waves.', objective: 'Collect 4 power cells.', target: 4 },
      { name: 'Lightning Shoal', story: 'Lightning is striking the shoal. Gather more cells to keep the warning signal alive.', objective: 'Collect 5 power cells.', target: 5 },
      { name: 'North Signal Tower', story: 'One final charge will warn every harbor along the coast.', objective: 'Collect 6 power cells.', target: 6 },
    ],
  },
  {
    id: 'wildwood-delivery', number: '21', title: 'Wildwood Delivery', subtitle: 'The Lantern Route', category: 'MAZE ADVENTURE', mark: 'WD', tone: 'marigold', mode: 'maze',
    description: 'Carry a lantern through forest paths to reunite two villages.',
    story: 'A bridge has washed out between the villages. Courier Pip carries a message and lantern along the old forest paths.',
    stages: [
      { name: 'Mossway', story: 'The first path is overgrown. Find every lantern oil drop and reach the trail marker.', objective: 'Collect all lantern oil and reach the marker.', target: 3 },
      { name: 'Root Hall', story: 'Roots have shifted the old passage. Light the way to the buried trail sign.', objective: 'Collect all lantern oil and reach the marker.', target: 4 },
      { name: 'Dawn Bridge', story: 'The bridge is safe at last. Carry the final message across before sunrise.', objective: 'Collect all lantern oil and reach the marker.', target: 5 },
    ],
  },
]
