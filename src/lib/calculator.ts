export interface CalculatorAnswers {
  transport: {
    vehicleType: 'gas' | 'hybrid' | 'ev' | 'none';
    weeklyMileage: number;
  };
  energy: {
    homeSize: 'small' | 'medium' | 'large';
    energySource: 'renewable' | 'mixed' | 'fossil';
  };
  food: {
    dietType: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan';
  };
  waste: {
    recycleHabit: 'rarely' | 'sometimes' | 'always';
  };
  shopping: {
    frequency: 'rarely' | 'average' | 'frequently';
  };
  water: {
    showerDuration: 'short' | 'average' | 'long';
  };
}

export interface CalculationResult {
  type: string;
  carbonValue: number; // in kg CO2e per year
  description: string;
}

export function calculateCarbonFootprint(answers: CalculatorAnswers): { total: number; categories: CalculationResult[] } {
  const categories: CalculationResult[] = [];

  // 1. Transportation
  let transportFactor = 0.4; // kg CO2 per mile for gas
  if (answers.transport.vehicleType === 'hybrid') transportFactor = 0.2;
  if (answers.transport.vehicleType === 'ev') transportFactor = 0.1;
  if (answers.transport.vehicleType === 'none') transportFactor = 0;
  
  const transportEmissions = answers.transport.weeklyMileage * 52 * transportFactor;
  categories.push({
    type: 'transport',
    carbonValue: transportEmissions,
    description: `Weekly driving of ${answers.transport.weeklyMileage} miles in a ${answers.transport.vehicleType} vehicle.`
  });

  // 2. Home Energy
  let energyBase = 3000; // Average mixed energy home in kg
  if (answers.energy.homeSize === 'small') energyBase *= 0.6;
  if (answers.energy.homeSize === 'large') energyBase *= 1.5;
  
  if (answers.energy.energySource === 'renewable') energyBase *= 0.1;
  if (answers.energy.energySource === 'fossil') energyBase *= 1.3;

  categories.push({
    type: 'energy',
    carbonValue: energyBase,
    description: `Home energy for a ${answers.energy.homeSize} home using ${answers.energy.energySource} energy.`
  });

  // 3. Food
  let foodEmissions = 2000; // average
  if (answers.food.dietType === 'meat-heavy') foodEmissions = 3300;
  if (answers.food.dietType === 'vegetarian') foodEmissions = 1500;
  if (answers.food.dietType === 'vegan') foodEmissions = 1000;

  categories.push({
    type: 'food',
    carbonValue: foodEmissions,
    description: `Food consumption based on a ${answers.food.dietType} diet.`
  });

  // 4. Waste
  let wasteEmissions = 1000;
  if (answers.waste.recycleHabit === 'always') wasteEmissions = 300;
  if (answers.waste.recycleHabit === 'sometimes') wasteEmissions = 600;

  categories.push({
    type: 'waste',
    carbonValue: wasteEmissions,
    description: `Waste generated, recycling ${answers.waste.recycleHabit}.`
  });

  // 5. Shopping
  let shoppingEmissions = 1500;
  if (answers.shopping.frequency === 'rarely') shoppingEmissions = 500;
  if (answers.shopping.frequency === 'frequently') shoppingEmissions = 3000;

  categories.push({
    type: 'shopping',
    carbonValue: shoppingEmissions,
    description: `Shopping and consumption frequency: ${answers.shopping.frequency}.`
  });

  // 6. Water
  let waterEmissions = 300;
  if (answers.water.showerDuration === 'short') waterEmissions = 150;
  if (answers.water.showerDuration === 'long') waterEmissions = 600;

  categories.push({
    type: 'water',
    carbonValue: waterEmissions,
    description: `Water usage based on ${answers.water.showerDuration} shower durations.`
  });

  const total = categories.reduce((sum, cat) => sum + cat.carbonValue, 0);

  return {
    total,
    categories
  };
}
