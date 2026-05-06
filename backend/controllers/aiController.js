import Transaction from "../models/Transaction.js";

const getMonthRange = (offset = 0) => {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);

  return { start, end };
};

const getCategoryTotals = (transactions) => {
  const totals = {};

  transactions
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      totals[item.category] = (totals[item.category] || 0) + item.amount;
    });

  return totals;
};

const addInsight = (insights, type, title, message) => {
  insights.push({ type, title, message });
};

export const getAIInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ date: -1 });

    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpense;

    const expenseByCategory = getCategoryTotals(transactions);

    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(-1);

    const thisMonthTransactions = transactions.filter((item) => {
      const date = new Date(item.date);
      return date >= thisMonth.start && date < thisMonth.end;
    });

    const lastMonthTransactions = transactions.filter((item) => {
      const date = new Date(item.date);
      return date >= lastMonth.start && date < lastMonth.end;
    });

    const thisMonthExpense = thisMonthTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const lastMonthExpense = lastMonthTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const thisMonthIncome = thisMonthTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const insights = [];

    if (transactions.length === 0) {
      addInsight(
        insights,
        "tip",
        "Start tracking your money",
        "Add your income and expenses to get smart saving suggestions."
      );
    }

    if (totalIncome === 0 && totalExpense > 0) {
      addInsight(
        insights,
        "warning",
        "Income not added",
        "You have expenses but no income added. Add your income for accurate financial analysis."
      );
    }

    if (totalIncome > 0 && totalExpense > totalIncome) {
      addInsight(
        insights,
        "danger",
        "Overspending alert",
        "Your total expenses are higher than your total income. Reduce unnecessary spending immediately."
      );
    }

    if (totalIncome > 0) {
      const expenseRatio = (totalExpense / totalIncome) * 100;

      if (expenseRatio >= 80) {
        addInsight(
          insights,
          "warning",
          "High spending ratio",
          `You are spending ${expenseRatio.toFixed(
            1
          )}% of your income. Try to keep expenses below 70%.`
        );
      }

      if (expenseRatio <= 50) {
        addInsight(
          insights,
          "success",
          "Good savings control",
          `Great! You are spending only ${expenseRatio.toFixed(
            1
          )}% of your income. Keep saving regularly.`
        );
      }
    }

    if (balance < 0) {
      addInsight(
        insights,
        "danger",
        "Negative balance",
        "Your balance is negative. Avoid new non-essential expenses until your income improves."
      );
    }

    if (balance > 0 && totalIncome > 0 && balance >= totalIncome * 0.3) {
      addInsight(
        insights,
        "success",
        "Strong saving habit",
        "You saved more than 30% of your income. This is a very good financial habit."
      );
    }

    const categoryEntries = Object.entries(expenseByCategory).sort(
      (a, b) => b[1] - a[1]
    );

    const topCategory = categoryEntries[0];

    if (topCategory) {
      const [category, amount] = topCategory;

      addInsight(
        insights,
        "tip",
        "Top spending category",
        `You spent the most on ${category}: ₹${amount}. Try setting a limit for this category.`
      );

      if (amount > totalExpense * 0.35) {
        addInsight(
          insights,
          "warning",
          `${category} is taking big share`,
          `${category} is more than 35% of your total expenses. Try reducing this category gradually.`
        );
      }
    }

    Object.entries(expenseByCategory).forEach(([category, amount]) => {
      const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;

      if (category === "Food" && percent > 30) {
        addInsight(
          insights,
          "tip",
          "Food spending is high",
          "Food is taking a large part of your expenses. Try home cooking or weekly meal planning."
        );
      }

      if (category === "Shopping" && percent > 20) {
        addInsight(
          insights,
          "tip",
          "Shopping needs control",
          "Shopping expense is high. Make a shopping list before buying and avoid impulse purchases."
        );
      }

      if (category === "Entertainment" && percent > 15) {
        addInsight(
          insights,
          "tip",
          "Entertainment cost is high",
          "Try low-cost plans like free events, home movie nights, or group discounts."
        );
      }

      if (category === "Travel" && percent > 20) {
        addInsight(
          insights,
          "tip",
          "Travel expense is high",
          "Try public transport, ride sharing, or monthly travel passes to reduce travel cost."
        );
      }
    });

    if (lastMonthExpense > 0) {
      const difference = thisMonthExpense - lastMonthExpense;
      const changePercent = (difference / lastMonthExpense) * 100;

      if (changePercent > 20) {
        addInsight(
          insights,
          "warning",
          "Expenses increased this month",
          `Your expenses increased by ${changePercent.toFixed(
            1
          )}% compared to last month. Check which category increased most.`
        );
      }

      if (changePercent < -10) {
        addInsight(
          insights,
          "success",
          "Expenses reduced this month",
          `Good job! Your expenses reduced by ${Math.abs(changePercent).toFixed(
            1
          )}% compared to last month.`
        );
      }
    }

    if (thisMonthIncome > 0 && thisMonthExpense > thisMonthIncome * 0.75) {
      addInsight(
        insights,
        "warning",
        "This month spending is high",
        "This month you spent more than 75% of your income. Try saving before spending."
      );
    }

    const averageDailyExpense =
      thisMonthExpense / new Date().getDate();

    if (averageDailyExpense > 1000) {
      addInsight(
        insights,
        "warning",
        "High daily spending",
        `Your average daily expense this month is ₹${averageDailyExpense.toFixed(
          0
        )}. Try setting a daily spending limit.`
      );
    }

    const projectedMonthlyExpense =
      averageDailyExpense *
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    if (thisMonthIncome > 0 && projectedMonthlyExpense > thisMonthIncome) {
      addInsight(
        insights,
        "danger",
        "Projected overspending",
        `At your current daily spending speed, your monthly expense may reach ₹${projectedMonthlyExpense.toFixed(
          0
        )}, which is higher than your income.`
      );
    }

    let score = 100;

    if (totalIncome === 0) score -= 20;
    if (totalExpense > totalIncome && totalIncome > 0) score -= 30;
    if (balance < 0) score -= 25;
    if (totalIncome > 0 && totalExpense > totalIncome * 0.8) score -= 15;
    if (topCategory && topCategory[1] > totalExpense * 0.35) score -= 10;
    if (balance > totalIncome * 0.3 && totalIncome > 0) score += 5;

    score = Math.max(0, Math.min(100, score));

    const summary =
      score >= 80
        ? "Your financial health looks good. You are managing your money well."
        : score >= 60
        ? "Your financial health is average. You can improve by controlling high spending categories."
        : "Your financial health needs attention. Focus on reducing expenses and tracking income properly.";

    if (insights.length === 0) {
      addInsight(
        insights,
        "success",
        "Everything looks balanced",
        "Your income and expenses look stable. Continue tracking regularly."
      );
    }

    res.json({
      totalIncome,
      totalExpense,
      balance,
      expenseByCategory,
      thisMonthExpense,
      lastMonthExpense,
      projectedMonthlyExpense: Math.round(projectedMonthlyExpense),
      averageDailyExpense: Math.round(averageDailyExpense),
      ai: {
        score,
        summary,
      },
      insights,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to generate AI insights",
    });
  }
};