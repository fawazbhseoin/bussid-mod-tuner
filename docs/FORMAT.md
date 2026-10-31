# What is known about the `.bussidmod` vehicle layout

This is reverse-engineered from one real vehicle mod. It is **not** an official specification. Each statement is marked as **verified** (checked by editing a file and re-reading it) or **inferred** (guessed from names).

## Container

- **Verified:** a `.bussidmod` vehicle file is a .NET `BinaryFormatter` stream. It starts with the bytes `00 01 00 00 00 ff ff ff ff 01 00 00 00 00 00 00 00 0c`, followed by the text `Assembly-CSharp` and the class name `ModFile+Header` (description, author, version, thumbnail).
- **Verified:** further objects follow, including `ModFile+VehicleHeader` and `VehicleData` (dictionaries named `partTypes`, `parts` and `materials`), and the 3D model data.
- Most of the file size is model and texture data. The tuning values are a few hundred bytes.

## How a named number is stored

**Verified.** Values of type `float` inside the vehicle dictionaries are stored as:

```
[1 byte: name length] [name in ASCII] [4 bytes: float32, little-endian]
```

Example for `maxSpeed = 120`: `08 6d 61 78 53 70 65 65 64 00 00 f0 42` (`0x42f00000` = 120.0).

Because the name is stored right before the number, the tool finds a value by searching for the name and overwrites the 4 bytes after it. Nothing is inserted or removed, so the file size and every other offset stay the same.

## Values

| Name | Group | What it is | Status |
|---|---|---|---|
| `force` | Engine | Engine power. Higher values accelerate harder. | name verified, effect inferred |
| `maxSpeed` | Engine | Top speed in km/h. | verified by the gear table also using km/h |
| `maxRPM` / `idleRPM` / `shiftUpRPM` | Engine | Engine speed limits and shift point. | inferred |
| `mass` | Handling | Vehicle mass (kg). | inferred |
| `centerOfMassHeightOffset` | Handling | Moves the centre of mass up or down. Lower is steadier. | inferred |
| `tireFriction` | Handling | Tyre grip. | inferred |
| `antiRoll` | Handling | Resistance to body lean. | inferred |
| `maxSteerAngle` | Handling | Steering lock in degrees. | inferred |
| `rollingResistance` | Handling | Drag from the wheels. | inferred |
| `maxBrakeForce` | Handling | Brake strength. | inferred |
| `tractionControlRatio`, `brakeAssistRatio`, `steeringLimitRatio`, `steeringAssistRatio` | Handling | Driver-assist strengths, 0 to 1. | inferred |

The handling values sit together in one dictionary of `string -> float` entries, with `tireFriction` near the middle. The engine values sit together a little later, ending with `maxSpeed`.

## Gear table

**Verified.** The `gears` entry holds a list of small dictionaries, each with two floats:

- `ratio`: the gear ratio.
- `shiftNextSpeed`: the speed (km/h) at which the gearbox changes up.

`BinaryFormatter` writes a repeated string only once. The first gear stores the text `ratio` and `shiftNextSpeed` inline, each as `06 [id: 4 bytes] [length][text]`. Every later gear refers back with `09 [id: 4 bytes]` followed by the float. The tool reads the two ids from the first gear and then collects every `09 [id]` reference after it.

The mod this was built from had **two sets of six gears** (12 entries in a row). The tool treats a drop in `shiftNextSpeed` as the start of a new set. What the second set is used for in the game is **unknown**, so both are edited the same way.

## Things that are not known

- Whether every BUSSID vehicle mod uses this exact layout. Mods made with other versions of the game's mod tools may differ.
- The exact in-game effect and valid range of each value. Extreme values can cause odd physics or crashes.
- How the game combines `force`, gear ratios and `maxRPM` into real acceleration.

If you can fill in any of these, please open a pull request.
