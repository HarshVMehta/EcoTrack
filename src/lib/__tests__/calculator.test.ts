import { calculateCarbonFootprint, CalculatorAnswers } from '../calculator';

describe('calculateCarbonFootprint', () => {
  const baseAnswers: CalculatorAnswers = {
    transport: { vehicleType: 'gas', weeklyMileage: 100 },
    energy: { homeSize: 'medium', energySource: 'mixed' },
    food: { dietType: 'average' },
    waste: { recycleHabit: 'sometimes' },
    shopping: { frequency: 'average' },
    water: { showerDuration: 'average' }
  };

  test('should calculate correct transportation emissions for gas vehicle', () => {
    const result = calculateCarbonFootprint(baseAnswers);
    // transport = 100 * 52 * 0.4 = 2080
    const transportResult = result.categories.find(c => c.type === 'transport');
    expect(transportResult).toBeDefined();
    expect(transportResult?.carbonValue).toBe(2080);
  });

  test('should calculate correct transportation emissions for EV vehicle', () => {
    const evAnswers: CalculatorAnswers = {
      ...baseAnswers,
      transport: { vehicleType: 'ev', weeklyMileage: 100 }
    };
    const result = calculateCarbonFootprint(evAnswers);
    // transport = 100 * 52 * 0.1 = 520
    const transportResult = result.categories.find(c => c.type === 'transport');
    expect(transportResult).toBeDefined();
    expect(transportResult?.carbonValue).toBe(520);
  });

  test('should adjust energy emissions based on home size and renewable source', () => {
    const renewableAnswers: CalculatorAnswers = {
      ...baseAnswers,
      energy: { homeSize: 'small', energySource: 'renewable' }
    };
    const result = calculateCarbonFootprint(renewableAnswers);
    // energyBase = 3000 * 0.6 (small) * 0.1 (renewable) = 180
    const energyResult = result.categories.find(c => c.type === 'energy');
    expect(energyResult).toBeDefined();
    expect(energyResult?.carbonValue).toBe(180);
  });

  test('should calculate correct food emissions for vegan diet', () => {
    const veganAnswers: CalculatorAnswers = {
      ...baseAnswers,
      food: { dietType: 'vegan' }
    };
    const result = calculateCarbonFootprint(veganAnswers);
    const foodResult = result.categories.find(c => c.type === 'food');
    expect(foodResult).toBeDefined();
    expect(foodResult?.carbonValue).toBe(1000);
  });

  test('should calculate correct food emissions for meat-heavy diet', () => {
    const meatAnswers: CalculatorAnswers = {
      ...baseAnswers,
      food: { dietType: 'meat-heavy' }
    };
    const result = calculateCarbonFootprint(meatAnswers);
    const foodResult = result.categories.find(c => c.type === 'food');
    expect(foodResult).toBeDefined();
    expect(foodResult?.carbonValue).toBe(3300);
  });

  test('should calculate total emissions correctly as sum of all categories', () => {
    const result = calculateCarbonFootprint(baseAnswers);
    const categorySum = result.categories.reduce((sum, cat) => sum + cat.carbonValue, 0);
    expect(result.total).toBe(categorySum);
  });
});
