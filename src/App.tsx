import { useState, useEffect, useCallback } from 'react';
import { ActivityList } from './components/ActivityList';
import { ActivityFilter } from './components/ActivityFilter';
import { DateRangeFilter } from './components/DateRangeFilter';
import { ActivityChart } from './components/ActivityChart';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { ActivityFilter as FilterType, BotActivity, DateRange, AppState } from './types';
import { fetchBotActivities } from './services/github';
import './App.css';

function App() {
  const [state, setState] = useState<AppState>({
    activities: [],
    loading: true,
    error: null,
    filter: {},
  });

  const loadActivities = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const since = state.filter.dateRange?.start;
      const activities = await fetchBotActivities(since);
      setState(prev => ({ ...prev, activities, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred while fetching activities',
      }));
    }
  }, [state.filter.dateRange?.start]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleFilterChange = (filter: FilterType) => {
    setState(prev => ({ ...prev, filter }));
  };

  const handleDateRangeChange = (dateRange?: DateRange) => {
    setState(prev => ({
      ...prev,
      filter: {
        ...prev.filter,
        dateRange,
      },
    }));
  };

  const filteredActivities = state.activities.filter((activity) => {
    if (state.filter.type && activity.type !== state.filter.type) return false;
    if (state.filter.status && activity.status !== state.filter.status) return false;
    if (state.filter.dateRange) {
      const activityDate = new Date(activity.timestamp);
      const startDate = new Date(state.filter.dateRange.start);
      const endDate = new Date(state.filter.dateRange.end);
      if (activityDate < startDate || activityDate > endDate) return false;
    }
    return true;
  });

  return (
    <div className="app">
      <h1>OpenHands Bot Activity Monitor</h1>
      
      <section className="filters">
        <h2>Filters</h2>
        <ActivityFilter
          filter={state.filter}
          onFilterChange={handleFilterChange}
        />
        <DateRangeFilter
          dateRange={state.filter.dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </section>

      {state.loading ? (
        <LoadingSpinner />
      ) : state.error ? (
        <ErrorMessage
          message={state.error}
          onRetry={loadActivities}
        />
      ) : (
        <>
          <section className="charts">
            <h2>Activity Charts</h2>
            <div className="chart-container">
              <ActivityChart activities={filteredActivities} type="issue" />
              <ActivityChart activities={filteredActivities} type="pr" />
            </div>
          </section>

          <section className="activity-list">
            <h2>Activity List</h2>
            <ActivityList activities={filteredActivities} />
          </section>
        </>
      )}
    </div>
  );
}

export default App;