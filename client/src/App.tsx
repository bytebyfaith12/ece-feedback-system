import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { useFeedbackStore } from "@/store/useFeedbackStore";
import {
  AdminPanel,
  AlertCenter,
  AlertSettings,
  AnalyticsOverview,
  AuditLogs,
  CategoryAnalytics,
  DeviceDetail,
  DeviceMonitoring,
  EmployeePulsePage,
  FacilitiesPage,
  FeedbackDetail,
  FeedbackInbox,
  FloorMapPage,
  HRSatisfactionPage,
  HourlyAnalytics,
  ITFeedbackPage,
  KioskGridPage,
  KioskPage,
  LandingPage,
  LocationAnalytics,
  LocationDetail,
  LocationsPage,
  LoginPage,
  NotificationSettings,
  OverviewDashboard,
  QRFeedbackPage,
  QRGridPage,
  RealTimeFeed,
  RecruitmentPage,
  ReportViewer,
  ReportsCenter,
  ResponseTrends,
  RoleAccess,
  SignupPage,
  SiteComparison,
  SmartTVWallboard,
  STLDashboard,
  SurveyManagement,
  TicketDetail,
  TicketingPage,
  TrainingFeedbackPage,
  TrendAnalysis,
  UserManagement,
  VisitorWelcomePage,
  WebFeedbackPage,
} from "@/pages/happy/HappyPages";

function ProtectedRoute() {
  const authenticated = useFeedbackStore((state) => state.authenticated);
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 11000 }}
        toastOptions={{
          duration: 2600,
          style: {
            background: "#07131c",
            color: "#ecfeff",
            border: "1px solid rgba(0,242,254,0.2)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/kiosk/:locationId" element={<KioskPage />} />
        <Route path="/qr/:locationId" element={<QRFeedbackPage />} />
        <Route path="/qr-feedback" element={<QRGridPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/tv" element={<SmartTVWallboard />} />
          <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<OverviewDashboard />} />
          <Route path="/pulse-feed" element={<RealTimeFeed />} />
          <Route path="/analytics" element={<AnalyticsOverview />} />
          <Route path="/analytics/hourly" element={<HourlyAnalytics />} />
          <Route path="/analytics/locations" element={<LocationAnalytics />} />
          <Route path="/analytics/categories" element={<CategoryAnalytics />} />
          <Route path="/analytics/trends" element={<TrendAnalysis />} />
          <Route path="/sites" element={<LocationsPage />} />
          <Route path="/accounts" element={<LocationAnalytics />} />
          <Route path="/categories" element={<CategoryAnalytics />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/locations/:id" element={<LocationDetail />} />
          <Route path="/locations/floor-map" element={<FloorMapPage />} />
          <Route path="/locations/site-comparison" element={<SiteComparison />} />
          <Route path="/feedback" element={<FeedbackInbox />} />
          <Route path="/feedback/new" element={<WebFeedbackPage />} />
          <Route path="/submit-feedback" element={<WebFeedbackPage />} />
          <Route path="/feedback/:id" element={<FeedbackDetail />} />
          <Route path="/case/:id" element={<FeedbackDetail />} />
          <Route path="/feedback/trends" element={<ResponseTrends />} />
          <Route path="/alerts" element={<AlertCenter />} />
          <Route path="/alerts/settings" element={<AlertSettings />} />
          <Route path="/tickets" element={<TicketingPage />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/devices" element={<DeviceMonitoring />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/reports" element={<ReportsCenter />} />
          <Route path="/reports/:id" element={<ReportViewer />} />
          <Route path="/kiosk" element={<KioskGridPage />} />
          <Route path="/qr" element={<QRGridPage />} />
          <Route path="/employee-pulse" element={<EmployeePulsePage />} />
          <Route path="/it-feedback" element={<ITFeedbackPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/hr-satisfaction" element={<HRSatisfactionPage />} />
          <Route path="/hr-payroll" element={<HRSatisfactionPage />} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          <Route path="/visitor-welcome" element={<VisitorWelcomePage />} />
          <Route path="/visitor-feedback" element={<VisitorWelcomePage />} />
          <Route path="/internet-outage" element={<ITFeedbackPage />} />
          <Route path="/wifi-quality" element={<ITFeedbackPage />} />
          <Route path="/ac-comfort" element={<FacilitiesPage />} />
          <Route path="/security" element={<VisitorWelcomePage />} />
          <Route path="/smoking-area" element={<FacilitiesPage />} />
          <Route path="/training" element={<TrainingFeedbackPage />} />
          <Route path="/stl" element={<STLDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/roles" element={<RoleAccess />} />
          <Route path="/admin/surveys" element={<SurveyManagement />} />
          <Route path="/admin/notifications" element={<NotificationSettings />} />
          <Route path="/admin/audit" element={<AuditLogs />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
