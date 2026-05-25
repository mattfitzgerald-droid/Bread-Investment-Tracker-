export async function GET() {
  try {
    const response = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/QQQ"
    );

    const data = await response.json();

    const price =
      data.chart.result[0].meta.regularMarketPrice;

    return Response.json({
      symbol: "QQQ",
      price,
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch QQQ price" },
      { status: 500 }
    );
  }
}
