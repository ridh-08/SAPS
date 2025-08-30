# South Asia Policy Simulation Game

A comprehensive web-based policy simulation game that models the complex interdependencies between South Asian countries. Players take control of one country and make policy decisions that affect not only their nation but create spillover effects throughout the entire region.

## 🌏 Features

### Core Gameplay
- **8 South Asian Countries**: India, Pakistan, Bangladesh, Sri Lanka, Nepal, Bhutan, Maldives, Afghanistan
- **20-Year Simulation**: Make policy decisions year by year from 2023 to 2043
- **Multi-Country AI**: All non-player countries are controlled by AI with realistic policy behaviors
- **Regional Interdependencies**: Your decisions create spillover effects on neighboring countries

### Policy Categories
- **Core Policies**: Education, Health, Infrastructure, Environment
- **Economic Policies**: Trade Liberalization, Tariffs, Regional Cooperation
- **Industry-Specific**: Agriculture, Manufacturing, Services, Energy, Technology, Tourism
- **Financial**: Fiscal Deficit, Foreign Investment Policy
- **Social**: Social Protection, Labor Market Flexibility

### Advanced Features
- **Real Data Integration**: Built to work with World Bank, UN, IMF, and other official datasets
- **Spillover Analysis**: Detailed visualization of how policies affect neighboring countries
- **Trade Network**: Interactive network showing bilateral trade relationships
- **Regional Events**: Random events like SAARC summits, trade disputes, natural disasters
- **Industry Specialization**: Countries have realistic economic profiles and comparative advantages

## 📊 Data Sources

The game is designed to integrate with real datasets from official sources:

### Primary Data Sources
1. **World Bank World Development Indicators**
   - GDP growth, unemployment, literacy, life expectancy, poverty, CO2 emissions
   - URL: `https://api.worldbank.org/v2/country/BGD;BTN;IND;MDV;NPL;PAK;LKA;AFG/indicator/...`

2. **World Bank Trade Data (WITS)**
   - Bilateral trade flows between South Asian countries
   - Product-level trade data and tariff information

3. **IMF Direction of Trade Statistics**
   - Comprehensive bilateral trade statistics
   - Trade balance and intensity indices

4. **UN Comtrade Database**
   - Detailed commodity trade data
   - Harmonized System (HS) classification

5. **Asian Development Bank Key Indicators**
   - Regional cooperation indices
   - Cross-border infrastructure investment data

### Industry-Specific Data
- **Agriculture**: World Bank agriculture indicators, FAO food security data
- **Manufacturing**: Industrial value-added, manufacturing exports
- **Services**: Services trade, digital economy indicators
- **Energy**: IEA energy statistics, renewable energy data
- **Technology**: R&D expenditure, patent data, digital infrastructure

## 🎮 Game Mechanics

### Policy Effects Model
Each policy decision affects multiple indicators through realistic economic relationships:

```javascript
// Example: Education spending effects
literacy_rate += education_spending_change * 0.8
gdp_growth += education_spending_change * 0.15  // Long-term productivity
unemployment -= education_spending_change * 0.2
```

### Spillover Effects
Your policy decisions create spillover effects on neighboring countries through:
- **Trade Spillovers**: Economic growth affects trading partners
- **Infrastructure Spillovers**: Cross-border connectivity projects
- **Environmental Spillovers**: Pollution and climate policies
- **Technology Spillovers**: Innovation and knowledge transfer
- **Investment Spillovers**: FDI and capital flows

### Regional Cooperation
- SAARC cooperation index affects all countries' policy effectiveness
- Higher cooperation reduces trade barriers and increases spillover benefits
- Regional events can boost or damage cooperation levels

## 🛠 Technical Implementation

### Built With
- **React + TypeScript**: Modern web application framework
- **D3.js**: Advanced data visualization and interactive charts
- **Tailwind CSS**: Responsive design and styling
- **Vite**: Fast development and build tooling

### Key Components
- `PolicyDashboard`: Interactive policy sliders and controls
- `StatsDisplay`: Country statistics with D3.js visualizations
- `RegionalDashboard`: Trade network and regional comparison
- `DetailedSpilloverDashboard`: Comprehensive spillover analysis
- `FinalReport`: End-game analysis and regional comparison

### Data Architecture
- Real-time CSV data loading from official APIs
- Modular policy effect models
- Comprehensive spillover calculation engine
- Historical data tracking for trend analysis

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with ES6+ support

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd south-asia-policy-simulation

# Install dependencies
npm install

# Start development server
npm run dev
```

### Using Real Data
1. The game includes direct links to official data sources
2. Replace mock data in `src/data/csvData.ts` with real API calls
3. Update `src/data/RealDataSources.ts` with your API keys if required
4. The data structure is already configured for seamless integration

## 📈 Game Flow

1. **Country Selection**: Choose your South Asian country
2. **Policy Dashboard**: Set initial policies across all categories
3. **Annual Simulation**: 
   - Make policy adjustments
   - View real-time effects on your country
   - Monitor spillover effects on neighbors
   - Respond to regional events
4. **Regional Analysis**: Track your impact on the broader South Asian economy
5. **Final Report**: Compare your performance against regional averages

## 🎯 Educational Value

This simulation teaches:
- **Economic Policy**: Understanding trade-offs between different policy choices
- **Regional Economics**: How countries are interconnected through trade and cooperation
- **Data Analysis**: Interpreting economic indicators and trends
- **Strategic Thinking**: Balancing national interests with regional cooperation
- **Real-World Complexity**: Appreciating the multifaceted nature of economic development

## 📝 Future Enhancements

- **Multiplayer Mode**: Multiple human players controlling different countries
- **Historical Scenarios**: Play through real historical events and crises
- **Advanced AI**: Machine learning-based AI opponents
- **Mobile App**: Native mobile version for broader accessibility
- **Educational Modules**: Integrated lessons on economic theory and policy

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional policy categories and effects
- More sophisticated economic models
- Enhanced visualizations
- Real-time multiplayer functionality
- Educational content and tutorials

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- World Bank for comprehensive development indicators
- UN Comtrade for detailed trade statistics
- Asian Development Bank for regional cooperation data
- All the open-source libraries that make this project possible

---

**Note**: This simulation is designed for educational purposes and uses simplified economic models. Real-world policy making involves many additional complexities not captured in this game.