export const generateInsights = (transactions) => {
  const expenses = transactions.filter((t) => t.type === "expense");

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = {};

  expenses.forEach((item) => {
    categoryTotals[item.category] =
      (categoryTotals[item.category] || 0) + item.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const insights = [];

  if (topCategory) {
    insights.push(
      `You spent the most on ${topCategory[0]}: ₹${topCategory[1]}. Try reducing this category by 10% next month.`
    );
  }

  if (totalExpense > 10000) {
    insights.push(
      "Your monthly expense is high. Try using the 50-30-20 budget rule."
    );
  }

  if (categoryTotals.Food > 3000) {
    insights.push(
      "Food expenses are high. Try meal planning or home cooking to save money."
    );
  }

  if (categoryTotals.Shopping > 2000) {
    insights.push(
      "Shopping spending is increasing. Avoid impulse purchases and make a wishlist before buying."
    );
  }

  if (categoryTotals.Transport > 2000) {
    insights.push(
      "Transport cost is high. Try public transport, carpooling, or monthly passes."
    );
  }

  if (insights.length === 0) {
    insights.push("Your spending looks balanced. Keep tracking regularly.");
  }

  return insights;
};