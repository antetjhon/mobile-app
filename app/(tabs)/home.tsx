"use client"

import axios from "axios";
import { Camera, CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { Bell, CreditCard, Eye, EyeOff, FilePenIcon, FileText, Home as HomeIcon, IdCard, Newspaper, QrCode, ScrollText, Search, Settings, UserRoundCog, X, } from "lucide-react-native";
import { useEffect, useState } from "react";
import { BackHandler, Dimensions, Image, Linking, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import Swiper from "react-native-swiper";
import { useAuth } from "../contexts/AuthContext";
import { getApiUrl } from "../utils/api";

const { width } = Dimensions.get("window")

interface Application {
  id: number
  business_name: string
  reference: string
  type: number
  status: number
  created_timestamp: string
  business_id_no?: string
  business_plate_no?: string
  isExpired?: boolean
}

interface ApplicationLog {
  id: number
  userId: number
  action: string
  description: string
  timestamp: string
  username: string
  fullName: string
  role: string
  by: string
}

interface LogsResponse {
  applicationId: number
  logs: ApplicationLog[]
}

export default function Home() {
  const router = useRouter()

  const { user, logout: authLogout, refetchUser, isLoading } = useAuth()

  // Function to clear all state data
  const clearAllData = () => {
    setApplications([])
    setClosures([])
    setSelectedApp(null)
    setPressedIndex(null)
    setConfirmedIndex(null)
    setActiveIcon(null)
    setApplicationLogs([])
    setApplicationAttachments([])
    setViewingAttachment(null)
    setSearchQuery("")
    setExpiredPermits(new Set())
    setCurrentPage(1)
    setShowAll(false)
    setYearFilter('all')
    setSpecificYear(new Date().getFullYear().toString())
    console.log("✅ All home data cleared")
  }




  const [applications, setApplications] = useState<Application[]>([])
  const [closures, setClosures] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showAll, setShowAll] = useState(false)
  const [hasMorePages, setHasMorePages] = useState(true)

  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [pressedIndex, setPressedIndex] = useState<number | null>(null)
  const [confirmedIndex, setConfirmedIndex] = useState<number | null>(null)
  const [activeIcon, setActiveIcon] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"applications" | "closure">("applications")

  // for logs
  const [logsVisible, setLogsVisible] = useState(false)
  const [applicationLogs, setApplicationLogs] = useState<ApplicationLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Add this with your other state declarations
  const [attachmentsVisible, setAttachmentsVisible] = useState(false)
  const [applicationAttachments, setApplicationAttachments] = useState<any[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(false)
  const [viewingAttachment, setViewingAttachment] = useState<{
    filename: string;
    contentType: string;
    data: string;
    size: number;
  } | null>(null)

  // for setting year
  const [yearFilterVisible, setYearFilterVisible] = useState(false)
  const [yearFilter, setYearFilter] = useState<'all' | 'current' | 'specific'>('all')
  const [specificYear, setSpecificYear] = useState<string>(new Date().getFullYear().toString())

  const [profileVisible, setProfileVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  // expired permits
  const [expiredPermits, setExpiredPermits] = useState<Set<number>>(new Set())

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // for alert logs design
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean
    title: string
    message: string
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  })

  // for QR code scanning
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  const isSmallDevice = windowWidth < 375;
  const isMediumDevice = windowWidth >= 375 && windowWidth < 768;
  const isLargeDevice = windowWidth >= 768;

  const getResponsiveSize = (small: number, medium: number, large: number) => {
    if (isSmallDevice) return small;
    if (isMediumDevice) return medium;
    return large;
  };

  const isTablet = windowWidth >= 600 || (windowWidth / windowHeight) > 0.6;
  const getResponsivePadding = () => {
    if (isSmallDevice) return 12;
    if (isMediumDevice) return 16;
    return 24;
  };

  const getResponsiveIconSize = () => {
    if (isSmallDevice) return 18;
    if (isMediumDevice) return 22;
    return 28;
  };

  const getModalWidth = () => {
    if (windowWidth < 640) return windowWidth - 32;
    if (windowWidth < 768) return 600;
    return 700;
  };

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      showCustomAlert(
        "Exit App?",
        "Are you sure you want to exit the application?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => {
              clearAllData()
              BackHandler.exitApp()
            }
          }
        ]
      )
      return true
    }

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    )

    return () => {
      backHandler.remove()
    }
  }, [])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log("Home component unmounting - clearing data")
      clearAllData()
    }
  }, [])

  // Fetch user data
  // ✅ ADD: Refetch user when screen is focused
  useEffect(() => {
    if (!user) {
      console.log("[HOME] No user found, refetching...")
      refetchUser()
    }
  }, [user])
  // Fetch applications when user is loaded or pagination changes
  useEffect(() => {
    if (user) {
      fetchApplications(currentPage, itemsPerPage)
    }
  }, [user, currentPage, showAll, yearFilter, specificYear])

  // Clear search when switching tabs
  useEffect(() => {
    setSearchQuery("")
  }, [activeTab])

  // Fetch applications from API
  const fetchApplications = async (page = 1, limit = 10) => {
    try {
      setLoading(true)

      const API_URL = await getApiUrl();
      let yearParam = null
      if (yearFilter === 'current') {
        yearParam = new Date().getFullYear()
      } else if (yearFilter === 'specific' && specificYear) {
        yearParam = parseInt(specificYear)
      }

      const params: any = {
        page: showAll ? 0 : page,
        limit: showAll ? 0 : limit,
      }

      if (yearParam) {
        params.year = yearParam
      }



      const res = await axios.get(`${API_URL}/applications/list`, {
        withCredentials: true,
        params: params,
      })



      if (res.data && res.data.applications && Array.isArray(res.data.applications)) {
        const regularApps = res.data.applications.filter((app: any) => app.type !== 3)
        const closureApps = res.data.applications.filter((app: any) => app.type === 3)

        setApplications(regularApps)
        setClosures(closureApps)

        const totalReturned = res.data.applications.length
        setHasMorePages(!showAll && totalReturned >= limit)


      }
    } catch (err) {
      console.log("Failed to fetch applications:", err)
      showCustomAlert("Error", "Failed to load applications. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Add this useEffect for camera permissions (place with other useEffects)
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Add this handler function before the return statement
  const handleScanQR = async () => {
    if (hasPermission === null) {
      showCustomAlert("Permission Required", "Requesting camera permission...");
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        showCustomAlert("Permission Denied", "Camera permission is required to scan QR codes.");
        return;
      }
    }

    if (hasPermission === false) {
      showCustomAlert("Permission Denied", "Camera permission is required to scan QR codes. Please enable it in settings.");
      return;
    }

    setShowScanner(true);
    setScanned(false);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
  if (scanned) return;

  setScanned(true);

  try {
    console.log("📱 QR Code Scanned:", data);
    
    let permitData: any = {};
    
    // Check if data is JSON or plain text
    if (data.trim().startsWith('{')) {
      // JSON format
      permitData = JSON.parse(data);
      
      if (permitData.permitType !== "BUSINESS_PERMIT") {
        setShowScanner(false);
        showCustomAlert(
          "Invalid QR Code",
          "This QR code is not a valid business permit.",
          [
            {
              text: "Try Again",
              onPress: () => {
                setScanned(false);
                setShowScanner(true);
              }
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setScanned(false)
            }
          ]
        );
        return;
      }
    } else {
      // Plain text format - Parse line by line
      if (!data.includes("BUSINESS PERMIT")) {
        setShowScanner(false);
        showCustomAlert(
          "Invalid QR Code",
          "This QR code is not a valid business permit.",
          [
            {
              text: "Try Again",
              onPress: () => {
                setScanned(false);
                setShowScanner(true);
              }
            }
          ]
        );
        return;
      }

      // Extract data from plain text
      const extractValue = (label: string): string => {
        const regex = new RegExp(`${label}:\\s*(.+?)(?:\\n|$)`, 'i');
        const match = data.match(regex);
        return match ? match[1].trim() : 'N/A';
      };

      permitData = {
        permitType: "BUSINESS_PERMIT",
        businessName: extractValue("Business Name"),
        businessAddress: extractValue("Address"),
        ownerName: extractValue("Owner"),
        businessPermitNo: extractValue("Permit No"),
        businessIdNo: extractValue("Business ID"),
        applicationType: extractValue("Application Type"),
        businessType: extractValue("Business Type"),
        dateIssued: extractValue("Date Issued"),
        validUntil: extractValue("Valid Until"),
        receiptNo: extractValue("Receipt No")
      };
    }
    
    // Close scanner
    setShowScanner(false);
    
    // Show permit information with options
    showCustomAlert(
      "Business Permit Found",
      `Business: ${permitData.businessName || 'N/A'}\n` +
      `Owner: ${permitData.ownerName || 'N/A'}\n` +
      `Permit No: ${permitData.businessPermitNo || 'N/A'}\n` +
      `Business ID: ${permitData.businessIdNo || 'N/A'}\n` +
      `Type: ${permitData.applicationType || 'N/A'}\n` +
      `Business Type: ${permitData.businessType || 'N/A'}\n` +
      `Valid Until: ${permitData.validUntil || 'N/A'}\n` +
      `Receipt No: ${permitData.receiptNo || 'N/A'}`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setScanned(false)
        },
        
          
        
        {
          text: "View Details",
          onPress: () => {
            setScanned(false);
            showPermitDetails(permitData);
          }
        }
      ]
    );
  } catch (error) {
    console.error("❌ QR Parse error:", error);
    setShowScanner(false);
    showCustomAlert(
      "Invalid QR Code",
      "Could not read QR code data. This may not be a valid business permit QR code.\n\nPlease ensure you're scanning a valid EBPLS business permit.",
      [
        {
          text: "Try Again",
          onPress: () => {
            setScanned(false);
            setShowScanner(true);
          }
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setScanned(false)
        }
      ]
    );
  }
};

const showPermitDetails = (permitData: any) => {
  showCustomAlert(
    `📋PERMIT`,
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📌 Permit Information\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🏢 Business Name:\n${permitData.businessName || 'N/A'}\n` +
    `📍 Address:\n${permitData.businessAddress || 'N/A'}\n` +
    `👤 Owner:${permitData.ownerName || 'N/A'}\n` +
    `🆔 Permit No:${permitData.businessPermitNo || 'N/A'}\n` +
    `🔖 Business ID:${permitData.businessIdNo || 'N/A'}\n` +
    `📂 Application Type:${permitData.applicationType || 'N/A'}\n` +
    `🏪 Business Type:${permitData.businessType || 'N/A'}\n` +
    `📅 Date Issued:${permitData.dateIssued || 'N/A'}\n` +
    `⏰ Valid Until:${permitData.validUntil || 'N/A'}\n` +
    `🧾 Receipt No:${permitData.receiptNo || 'N/A'}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    [
      {
        text: "Close",
        style: "cancel"
      },
      
      
    ]
  );
};

  const showCustomAlert = (
    title: string,
    message: string,
    buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>
  ) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK', onPress: () => setCustomAlert(prev => ({ ...prev, visible: false })) }]
    })
  }

  // Add this function with your other handlers
  const handleViewAttachments = async (app: Application | null) => {
    if (!app || !app.id) {
      showCustomAlert("Error", "Invalid application data")
      return
    }

    try {
      setLoadingAttachments(true)
      setAttachmentsVisible(true)
      setApplicationAttachments([])

      const API_URL = await getApiUrl();



      const response = await axios.get(
        `${API_URL}/applications/${app.id}/attachments`,
        {
          withCredentials: true,
          timeout: 15000,
        }
      )

      if (response.data && Array.isArray(response.data)) {

        setApplicationAttachments(response.data)
      } else {
        setApplicationAttachments([])
      }
    } catch (error: any) {
      console.error("[ATTACHMENTS] Error fetching attachments:", error)

      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          showCustomAlert("Session Expired", "Please log out and log back in.", [
            { text: "OK", onPress: () => setAttachmentsVisible(false) }])
        } else if (status === 403) {
          showCustomAlert("Access Denied", "You don't have permission to view attachments.", [
            { text: "OK", onPress: () => setAttachmentsVisible(false) }])
        } else {
          showCustomAlert("Error", "Failed to load attachments.", [
            { text: "OK", onPress: () => setAttachmentsVisible(false) }])
        }
      }
    } finally {
      setLoadingAttachments(false)
    }
  }

  const checkPermitExpiration = async (applicationId: number): Promise<boolean> => {
    try {
      const API_URL = await getApiUrl();
      const response = await axios.get(
        `${API_URL}/applications/${applicationId}/permit/expired`,
        { withCredentials: true }
      )
      return response.data?.isExpired || false
    } catch (error) {
      console.error(`[EXPIRED CHECK] Error checking expiration for app ${applicationId}:`, error)
      return false
    }
  }

  useEffect(() => {
    const checkAllExpirations = async () => {
      if (applications.length === 0) return

      const expired = new Set<number>()

      for (const app of applications) {
        if (app.status === 6) {
          const isExpired = await checkPermitExpiration(app.id)
          if (isExpired) {
            expired.add(app.id)
          }
        }
      }

      setExpiredPermits(expired)
    }

    checkAllExpirations()
  }, [applications])

  const handleViewAttachmentFile = async (attachmentId: number, filename: string) => {
    if (!selectedApp || !selectedApp.id) {
      showCustomAlert("Error", "Invalid application data")
      return
    }

    try {
      setLoadingAttachments(true)

      console.log("[ATTACHMENT FILE] Fetching file:", filename)
      console.log("[ATTACHMENT FILE] Application ID:", selectedApp.id)
      console.log("[ATTACHMENT FILE] Attachment ID:", attachmentId)
      const API_URL = await getApiUrl();
      const response = await axios.get(
        `${API_URL}/applications/${selectedApp.id}/attachments/${attachmentId}/base64`,
        {
          withCredentials: true,
          timeout: 30000
        }
      )

      if (response.data) {
        console.log("[ATTACHMENT FILE] File loaded successfully")
        setViewingAttachment(response.data)
      }
    } catch (error: any) {
      console.error("[ATTACHMENT FILE] Error fetching attachment:", error)

      if (error.response) {
        const status = error.response.status
        const errorMessage = error.response.data?.error || "Unknown error"

        if (status === 401) {
          showCustomAlert("Session Expired", "Your session has expired. Please log out and log back in.", [{
            text: "OK",
            style: 'destructive',
            onPress: () => {
              setViewingAttachment(null)
              handleLogout()
            }
          }])
        } else if (status === 403) {
          showCustomAlert("Access Denied", `You don't have permission to view this attachment.\n\nFile: ${filename}`)
        } else if (status === 404) {
          showCustomAlert("File Not Found", `The file "${filename}" could not be found on the server.\n\nIt may have been deleted or moved.`)
        } else if (status === 500) {
          showCustomAlert("Server Error", `The server encountered an error while loading "${filename}".\n\nPlease try again later.`)
        } else {
          showCustomAlert("Error", `Failed to load attachment (Status: ${status})\n\nFile: ${filename}\n\n${errorMessage}`)
        }
      } else if (error.code === "ECONNABORTED") {
        showCustomAlert("Timeout", `Loading "${filename}" took too long. Please try again.`)
      } else if (error.message.includes("Network")) {
        showCustomAlert("Connection Error", "Cannot reach the server. Please check your internet connection.")
      } else {
        showCustomAlert("Error", `Failed to load attachment: ${filename}\n\nError: ${error.message}`)
      }
    } finally {
      setLoadingAttachments(false)
    }
  }

  // Add this function to fetch logs
  const handleOpenLogs = async (app: Application | null) => {
    if (!app || !app.id) {
      showCustomAlert("Error", "Invalid application data")
      return
    }

    try {
      setLoadingLogs(true)
      setLogsVisible(true)
      setApplicationLogs([])

      console.log("[LOGS] Fetching logs for application:", app.id)
      const API_URL = await getApiUrl();
      const response = await axios.get<LogsResponse>(
        `${API_URL}/applications/${app.id}/logs`,
        {
          withCredentials: true,
          timeout: 15000,
        }
      )

      if (response.data && response.data.logs) {
        console.log("[LOGS] Successfully fetched", response.data.logs.length, "logs")
        setApplicationLogs(response.data.logs)
      }
    } catch (error: any) {
      console.error("[LOGS] Error fetching logs:", error)
      console.error("[LOGS] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })

      if (error.response) {
        const status = error.response.status
        const errorMessage = error.response.data?.error || "Unknown error"

        if (status === 401) {
          showCustomAlert("Session Expired", "Your session has expired. Please log out and log back in.", [{
            text: "OK",
            style: 'destructive',
            onPress: () => {
              setLogsVisible(false)
              handleLogout()
            }
          }])
        } else if (status === 403) {
          showCustomAlert("Access Denied", `You don't have permission to view logs for this application.\n\nApplication: ${app.business_name}`, [
            { text: "OK", onPress: () => setLogsVisible(false) }])
        } else if (status === 404) {
          showCustomAlert("Not Found", `Application not found or has been archived.\n\nApplication: ${app.business_name}`, [
            { text: "OK", onPress: () => setLogsVisible(false) }])
        } else if (status === 500) {
          showCustomAlert("Server Error", `The server encountered an error:\n\n${errorMessage}\n\nPlease try again or contact support if the issue persists.`, [
            { text: "OK", onPress: () => setLogsVisible(false) }])
        } else {
          showCustomAlert("Error", `Failed to load logs (Status: ${status})\n\n${errorMessage}`, [
            { text: "OK", onPress: () => setLogsVisible(false) }])
        }
      } else if (error.code === "ECONNABORTED") {
        showCustomAlert("Timeout", "The request took too long. Please try again.", [
          { text: "OK", onPress: () => setLogsVisible(false) }])
      } else if (error.message.includes("Network")) {
        showCustomAlert("Connection Error", "Cannot reach the server. Please check your internet connection.", [
          { text: "OK", onPress: () => setLogsVisible(false) }])
      } else {
        showCustomAlert("Error", `Failed to load logs.\n\nError: ${error.message}`, [
          { text: "OK", onPress: () => setLogsVisible(false) }])
      }
    } finally {
      setLoadingLogs(false)
    }
  }

  const formatTimestampPhilippine = (timestamp: string) => {
    if (!timestamp) return 'N/A';

    try {
      if (timestamp.includes('+08:00') || timestamp.includes('+0800')) {
        const date = new Date(timestamp);

        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }

      const date = new Date(timestamp);
      return date.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return timestamp;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "N/A"
    try {
      const date = new Date(timestamp)
      return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return timestamp
    }
  }

  const getActionColor = (action: string) => {
    const actionColors: Record<string, string> = {
      DRAFT: "bg-gray-500",
      APPLY: "bg-blue-500",
      VERIFY: "bg-indigo-500",
      ENDORSE: "bg-purple-500",
      ASSESS: "bg-yellow-500",
      PAYMENT: "bg-orange-500",
      RELEASE: "bg-green-500",
      UPDATE: "bg-cyan-500",
      "RELEASE-PERMIT": "bg-green-600",
    }
    return actionColors[action] || "bg-gray-400"
  }

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true)
    setCurrentPage(1)
    await fetchApplications(1, itemsPerPage)
    setRefreshing(false)
  }

  // Toggle between paginated and show all
  const handleToggleShowAll = () => {
    setShowAll(!showAll)
    setCurrentPage(1)
  }

  // Pagination handlers
  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPage((prev) => Math.max(1, prev - 1))
    }
  }
  const handleUpdateApplication = async (app: Application | null) => {
    if (!app || !app.id) {
      showCustomAlert("Error", "Invalid application data")
      return
    }

    // Check for null/undefined status
    if (app.status === undefined || app.status === null) {
      showCustomAlert("Error", "Application status is not available")
      return
    }

    const isExpired = expiredPermits.has(app.id)

    // Define editable statuses
    const editableStatuses = [0, 1, 6]
    const canEdit = editableStatuses.includes(app.status) || isExpired

    // If not editable, show alert and return
    if (!canEdit) {
      const statusInfo = getStatusInfo(app.status)
      showCustomAlert(
        "Cannot Edit",
        `This application cannot be edited.\n\nCurrent Status: ${statusInfo.text}\n\nOnly applications with status "Draft" , "For Verification" , "Permit Issued" , or with Expired Permits can be edited.`,
        [
          {
            text: "OK",
            onPress: () => setCustomAlert(prev => ({ ...prev, visible: false }))
          }
        ]
      )
      return
    }

    // Check if renewal already exists for expired permits
    if (isExpired) {
      try {
        const API_URL = await getApiUrl();
        const checkResponse = await axios.get(
          `${API_URL}/applications/${app.id}/renewal/check`,
          { withCredentials: true }
        )

        if (checkResponse.data?.renewalExists) {
          showCustomAlert(
            "Already Submitted",
            "A renewal application has already been submitted for this permit.\n\nPlease check your applications list.",
            [{ text: "OK" }]
          )
          return
        }
      } catch (error: any) {
        // Silent error handling for renewal check
        console.log("[UPDATE] Renewal check error:", error.message)
      }
    }

    
    setSelectedApp(null)

    
    setTimeout(() => {
      router.push({
        pathname: "/fillup",
        params: {
          mode: "update",
          applicationId: app.id.toString(),
          timestamp: Date.now().toString(),
        },
      })
    }, 100)
  }

  const canGoNext = !showAll && hasMorePages
  const canGoPrevious = !showAll && currentPage > 1

  // Filter applications based on search query
  const filteredApplications = applications.filter(
    (app) =>
      app.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.business_id_no && app.business_id_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.business_plate_no && app.business_plate_no.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredClosures = closures.filter(
    (closure) =>
      closure.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      closure.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (closure.business_id_no && closure.business_id_no.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Helper function to get status text and color
  const getStatusInfo = (statusCode: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      0: { text: "Draft", color: "text-green-600" },
      1: { text: "For Verification", color: "text-blue-600" },
      2: { text: "For Endorse", color: "text-indigo-600" },
      3: { text: "For Assessment", color: "text-yellow-600" },
      4: { text: "For Payment", color: "text-orange-600" },
      5: { text: "For Release", color: "text-purple-600" },
      6: { text: "Permit Issued", color: "text-green-600" },
      8: { text: "Paid Online", color: "text-yellow-600" },
      21: { text: "Cancelled", color: "text-red-600" },
      22: { text: "Verification Failed", color: "text-red-600" },
      23: { text: "Endorsement Failed", color: "text-red-600" },
    }
    return statusMap[statusCode] || { text: "Unknown", color: "text-gray-600" }
  }

  // Helper function to get application type text
  const getApplicationTypeText = (typeCode: number) => {
    const typeMap: Record<number, string> = {
      1: "New",
      2: "Renewal",
      3: "Closure",
    }
    return typeMap[typeCode] || "Unknown"
  }

  // Helper function to format date
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A"
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
  }

  // Logout with confirmation and redirection
  const handleLogout = async () => {
    showCustomAlert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("[LOGOUT] Starting logout process...")

            // 1. Use AuthContext logout (clears session)
            await authLogout()

            // 2. Clear all local component state
            clearAllData()

            // 3. Close profile modal if open
            setProfileVisible(false)

            console.log("[LOGOUT] All data cleared successfully")

            // 4. Navigate to login and RESET navigation stack
            router.replace("/")

            // 5. FORCE clear navigation state (this ensures fillup unmounts)
            setTimeout(() => {
              if (router.canGoBack()) {
                router.dismissAll();
              }
            }, 100);

            console.log("[LOGOUT] Redirected to login screen")

          } catch (err: any) {
            console.error("[LOGOUT] Logout error:", err)

            // Even if there's an error, still clear and navigate
            clearAllData()
            setProfileVisible(false)
            router.replace("/")

            console.log("[LOGOUT] Forced logout - local data cleared")
          }
        },
      },
    ])
  }

  // Handle payment action
  const handlePayment = (app: any) => {
    showCustomAlert("Payment", `Process payment for "${app.business_name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Proceed",
        onPress: () => {
          showCustomAlert("Info", "Payment processing feature will be implemented")
        },
      },
    ])
  }

  // Confirmation for Create/Renew
  const handleCardPress = (index: number) => {
    const action = index === 0 ? "CREATE NEW APPLICATION" : "RENEW APPLICATION"
    showCustomAlert("Confirmation", `Are you sure you want to ${action}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          setConfirmedIndex(index)
          router.push("/fillup")
        },
      },
    ])
  }

  const handleOpenPDF = async (app: Application | null) => {
    if (!app || !app.id) {
      showCustomAlert("Error", "Invalid application data")
      return
    }

    try {
      const API_URL = await getApiUrl();
      const pdfUrl = `${API_URL}/applications/${app.id}/pdf`
      console.log("[v0] ========== Application PDF Download ==========")
      console.log("[v0] User ID:", user?.id)
      console.log("[v0] Application ID:", app.id)
      console.log("[v0] Business Name:", app.business_name)
      console.log("[v0] PDF URL:", pdfUrl)
      console.log("[v0] ===============================================")

      const response = await axios.get(pdfUrl, {
        withCredentials: true,
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          Accept: "application/pdf",
        },
      })

      console.log("[v0] Application PDF downloaded successfully")

      const uint8Array = new Uint8Array(response.data)
      let binaryString = ""
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i])
      }
      const base64Data = btoa(binaryString)

      const fileUri = `${FileSystem.cacheDirectory}application_${app.id}.pdf`
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const isAvailable = await Sharing.isAvailableAsync()
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: `${app.business_name} - Application`,
          UTI: "com.adobe.pdf",
        })
      } else {
        const supported = await Linking.canOpenURL(fileUri)
        if (supported) {
          await Linking.openURL(fileUri)
        } else {
          showCustomAlert("Success", "PDF downloaded successfully but cannot be opened automatically.")
        }
      }
    } catch (error: any) {
      console.error("[v0] Error opening application PDF:", error)

      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          showCustomAlert("Session Expired", "Your session has expired. Please log out and log back in.", [
            { text: "OK", onPress: () => { setSelectedApp(null); handleLogout() } },
          ])
        } else if (status === 403) {
          showCustomAlert("Access Denied", `You don't have permission to view this PDF.\n\nApplication: ${app.business_name}`)
        } else if (status === 404) {
          showCustomAlert("PDF Not Found", `The PDF for this application could not be found.\n\nApplication: ${app.business_name}`)
        } else if (status === 500) {
          showCustomAlert("Server Error", `The server encountered an error.\n\nPlease try again later.`)
        } else {
          showCustomAlert("Error", `Failed to download PDF (Status: ${status})`)
        }
      } else if (error.message.includes("Network") || error.message.includes("timeout")) {
        showCustomAlert("Connection Error", "Cannot reach the server. Please check your connection.")
      } else {
        showCustomAlert("Error", `Failed to open PDF.\n\nError: ${error.message}`)
      }
    }
  }

  const handleOpenAssessment = async (app: Application | null) => {
    if (!app || !app.id) {
      showCustomAlert("Error", "Invalid application data")
      return
    }

    try {
      const API_URL = await getApiUrl();
      const assessmentUrl = `${API_URL}/applications/${app.id}/assessment`
      console.log("[ASSESSMENT] ========== Assessment PDF Download ==========")
      console.log("[ASSESSMENT] User ID:", user?.id)
      console.log("[ASSESSMENT] Application ID:", app.id)
      console.log("[ASSESSMENT] Business Name:", app.business_name)
      console.log("[ASSESSMENT] Assessment URL:", assessmentUrl)
      console.log("[ASSESSMENT] ============================================")

      showCustomAlert("Downloading", "Please wait while we generate your assessment PDF...")

      const response = await axios.get(assessmentUrl, {
        withCredentials: true,
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          Accept: "application/pdf",
        },
      })

      console.log("[ASSESSMENT] Assessment PDF downloaded successfully")

      const uint8Array = new Uint8Array(response.data)
      let binaryString = ""
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i])
      }
      const base64Data = btoa(binaryString)

      const fileUri = `${FileSystem.cacheDirectory}assessment_${app.id}.pdf`
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const isAvailable = await Sharing.isAvailableAsync()
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: `${app.business_name} - Tax Assessment`,
          UTI: "com.adobe.pdf",
        })
      } else {
        const supported = await Linking.canOpenURL(fileUri)
        if (supported) {
          await Linking.openURL(fileUri)
        } else {
          showCustomAlert("Success", "Assessment PDF downloaded successfully!")
        }
      }
    } catch (error: any) {
      console.error("[ASSESSMENT] Error opening assessment PDF:", error)

      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          showCustomAlert("Session Expired", "Your session has expired. Please log out and log back in.", [
            { text: "OK", onPress: () => { setSelectedApp(null); handleLogout() } },
          ])
        } else if (status === 403) {
          showCustomAlert("Access Denied", `You don't have permission to view this assessment.\n\nApplication: ${app.business_name}`)
        } else if (status === 404) {
          showCustomAlert("Assessment Not Found", `The assessment for this application could not be found.\n\nApplication: ${app.business_name}`)
        } else if (status === 500) {
          showCustomAlert("Server Error", `The server encountered an error.\n\nPlease try again later.`)
        } else {
          showCustomAlert("Error", `Failed to download assessment PDF (Status: ${status})`)
        }
      } else if (error.code === "ECONNABORTED") {
        showCustomAlert("Timeout", "The request took too long. Please try again.")
      } else if (error.message.includes("Network")) {
        showCustomAlert("Connection Error", "Cannot reach the server. Please check your internet connection.")
      } else {
        showCustomAlert("Error", `Failed to open assessment PDF.\n\nError: ${error.message}`)
      }
    }
  }

  const sliderHeight = isTablet ? 250 : getResponsiveSize(140, 143, 250);

  const handleOpenPermitPDF = async (app: Application | null) => {
    if (!app || !app.id) {
      showCustomAlert("Error", "Invalid application data")
      return
    }

    if (app.status !== 6) {
      showCustomAlert(
        "Permit Not Available",
        `The permit for "${app.business_name}" has not been issued yet.\n\nCurrent Status: ${getStatusInfo(app.status).text}\n\nPlease wait for the permit to be issued by the BPLO office.`,
        [{ text: "OK" }]
      )
      return
    }

    try {
      const API_URL = await getApiUrl();
      const pdfUrl = `${API_URL}/applications/${app.id}/permit/pdf`
      console.log("[PERMIT] ========== Permit PDF Download ==========")
      console.log("[PERMIT] User ID:", user?.id)
      console.log("[PERMIT] Application ID:", app.id)
      console.log("[PERMIT] Business Name:", app.business_name)
      console.log("[PERMIT] Status:", app.status)
      console.log("[PERMIT] Permit PDF URL:", pdfUrl)
      console.log("[PERMIT] ============================================")

      showCustomAlert("Downloading", "Please wait while we generate your permit PDF...")

      const response = await axios.get(pdfUrl, {
        withCredentials: true,
        responseType: "arraybuffer",
        timeout: 30000,
        headers: {
          Accept: "application/pdf",
        },
      })

      console.log("[PERMIT] Permit PDF downloaded successfully")
      console.log("[PERMIT] Response size:", response.data.byteLength, "bytes")

      const uint8Array = new Uint8Array(response.data)
      let binaryString = ""
      for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i])
      }
      const base64Data = btoa(binaryString)

      const fileUri = `${FileSystem.cacheDirectory}permit_${app.id}.pdf`
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      })

      console.log("[PERMIT] PDF saved to:", fileUri)

      const isAvailable = await Sharing.isAvailableAsync()
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/pdf",
          dialogTitle: `${app.business_name} - Business Permit`,
          UTI: "com.adobe.pdf",
        })
      } else {
        const supported = await Linking.canOpenURL(fileUri)
        if (supported) {
          await Linking.openURL(fileUri)
        } else {
          showCustomAlert("Success", `Permit PDF downloaded successfully!\n\nSaved to: ${fileUri}`)
        }
      }
    } catch (error: any) {
      console.error("[PERMIT] Error opening Permit PDF:", error)

      if (error.response) {
        const status = error.response.status
        console.error("[PERMIT] Response status:", status)
        console.error("[PERMIT] Response data:", error.response.data)

        if (status === 401) {
          showCustomAlert("Session Expired", "Your session has expired. Please log out and log back in.", [
            {
              text: "OK",
              onPress: () => {
                setSelectedApp(null)
                handleLogout()
              },
            },
          ])
        } else if (status === 403) {
          showCustomAlert(
            "Access Denied",
            `You don't have permission to view this permit.\n\nApplication: ${app.business_name}`
          )
        } else if (status === 404) {
          showCustomAlert(
            "Permit Not Issued",
            `The permit for this application has not been issued yet.\n\nApplication: ${app.business_name}\n\nPlease wait for the permit to be issued by the BPLO office.`
          )
        } else if (status === 500) {
          showCustomAlert(
            "Server Error",
            `The server encountered an error while generating your permit.\n\nThis has been logged. Please try again later or contact support if the issue persists.`
          )
        } else {
          showCustomAlert("Error", `Failed to download permit PDF (Status: ${status})`)
        }
      } else if (error.code === "ECONNABORTED") {
        showCustomAlert("Timeout", "The request took too long. The server might be busy. Please try again.")
      } else if (error.message.includes("Network")) {
        showCustomAlert("Connection Error", "Cannot reach the server. Please check your internet connection.")
      } else {
        showCustomAlert("Error", `Failed to open permit PDF.\n\nError: ${error.message}`)
      }
    }
  }
  return (
    <LinearGradient colors={["#c850c0", "#4158d0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-1">
      {/* HEADER */}
      <LinearGradient
        colors={["#f3f4f6", "#9ca3af"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="pt-10 pb-4 px-4 flex-row justify-between items-center"
      >
        <View className="flex-1 items-center">
          <View className="items-center">
            <Image
              source={require("../../assets/images/ebpls.png")}
              className="w-[150px] h-[60px]"
              resizeMode="contain"
            />
            <Text className="text-xs text-black font-semibold text-center">
              Electronic Business Permit and Licensing
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* MAIN CONTENT */}
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* WELCOME */}
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: getResponsivePadding(), paddingVertical: getResponsivePadding() }}>
          <View className="flex-row items-center flex-1">
            <Pressable onPress={() => setProfileVisible(true)}>
              <Image
                source={require("../../assets/images/leyte-logo.png")}
                style={{
                  width: getResponsiveSize(40, 48, 56),
                  height: getResponsiveSize(40, 48, 56)
                }}
                className="rounded-full mr-3"
              />
            </Pressable>
            <View className="flex-1">
              <Text
                className="text-white font-bold"
                style={{ fontSize: getResponsiveSize(15, 18, 20) }}
                numberOfLines={1}
              >
                {user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'User' : "Welcome"}
              </Text>
              <Text
                className="text-gray-200"
                style={{ fontSize: getResponsiveSize(11, 13, 14) }}
                numberOfLines={1}
              >
                {user ? `${user.role || 'User'} • ${user.username || ''}` : "Loading..."}
              </Text>
            </View>
          </View>
          <Pressable className="p-2 rounded-full" onPress={() => setYearFilterVisible(true)}>
            <Settings color="white" size={getResponsiveIconSize()} />
          </Pressable>
        </View>

        {/* SLIDER */}
        <View style={{ height: sliderHeight, marginBottom: 20, borderRadius: 12, overflow: 'hidden', marginTop: 16 }}>
          <Swiper
            autoplay
            autoplayTimeout={3}
            showsPagination
            dot={<View className="w-2 h-2 rounded-full bg-white/50 mx-1" />}
            activeDot={<View className="w-2 h-2 rounded-full bg-blue-500 mx-1" />}
            loop
          >
            <Image source={require("../../assets/images/1.png")} style={{ width: '100%', height: sliderHeight }} className="rounded-xl" resizeMode="cover" />
            <Image source={require("../../assets/images/2.png")} style={{ width: '100%', height: sliderHeight }} className="rounded-xl" resizeMode="cover" />
            <Image source={require("../../assets/images/3.png")} style={{ width: '100%', height: sliderHeight }} className="rounded-xl" resizeMode="cover" />
            <Image source={require("../../assets/images/4.png")} style={{ width: '100%', height: sliderHeight }} className="rounded-xl" resizeMode="cover" />
            <Image source={require("../../assets/images/55.png")} style={{ width: '100%', height: sliderHeight }} className="rounded-xl" resizeMode="cover" />
            <Image source={require("../../assets/images/66.png")} style={{ width: '100%', height: sliderHeight }} className="rounded-xl" resizeMode="cover" />
          </Swiper>
        </View>


        {/* CREATE / RENEW */}
        <View className="flex-row flex-wrap justify-center mb-6 mt-4">
          {[
            { title: "CREATE NEW APPLICATION", image: require("../../assets/images/new.png") },
            { title: "RENEW APPLICATION", image: require("../../assets/images/renew.png") },
          ].map((item, index) => (
            <Pressable
              key={index}
              className={`p-2 ${isSmallDevice ? 'w-full' : 'w-1/2'}`}
              onPress={() => handleCardPress(index)}
              onPressIn={() => setPressedIndex(index)}
              onPressOut={() => setPressedIndex(null)}
            >
              <View
                className={`bg-white rounded-xl overflow-hidden shadow-md border-2 ${confirmedIndex === index ? "border-red-500" : pressedIndex === index ? "border-blue-500" : "border-transparent"
                  }`}
                style={{ height: getResponsiveSize(120, 160, 180) }}
              >
                <Image source={item.image} className="w-full h-full" resizeMode="cover" />
                <View className="absolute bottom-0 w-full bg-black/50 py-2">
                  <Text
                    className="text-center text-white font-medium"
                    style={{ fontSize: getResponsiveSize(11, 13, 15) }}
                  >
                    {item.title}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* TABS */}
        <View className="flex-row bg-white rounded-t-xl shadow">
          {["Applications", "Closure"].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab.toLowerCase() as "applications" | "closure")}
              className={`flex-1 py-3 ${activeTab === tab.toLowerCase() ? "bg-blue-600 rounded-t-xl" : "bg-white"}`}
            >
              <Text className={`text-center font-semibold ${activeTab === tab.toLowerCase() ? "text-white" : "text-gray-600"}`}>
                {tab} ({tab.toLowerCase() === "applications" ? applications.length : closures.length})
              </Text>
            </Pressable>
          ))}
        </View>

        {/* PAGINATION CONTROLS WITH SEARCH */}
        {activeTab === "applications" && (
          <View className="bg-white px-3 py-2 border-b border-gray-200 flex-row justify-between items-center">
            <Pressable onPress={handleToggleShowAll} className={`px-4 py-2 rounded-lg ${showAll ? "bg-blue-600" : "bg-gray-200"}`}>
              <Text className={`text-xs font-semibold ${showAll ? "text-white" : "text-gray-700"}`}>
                {showAll ? "Show All" : "Paginate"}
              </Text>
            </Pressable>

            <View className="flex-1 flex-row items-center ml-3 bg-gray-100 rounded-lg px-3 py-2">
              <Search size={16} color="#6b7280" />
              <TextInput
                placeholder="Search business..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-2 text-sm text-gray-700"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        )}

        {/* CLOSURE TAB SEARCH */}
        {activeTab === "closure" && (
          <View className="bg-white px-3 py-2 border-b border-gray-200">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search size={16} color="#6b7280" />
              <TextInput
                placeholder="Search closure applications..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-2 text-sm text-gray-700"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        )}

        {/* LIST */}
        <View className="bg-white shadow-md rounded-b-xl">
          <View className="flex-row border-b border-gray-200 px-3 py-2 bg-gray-100">
            <Text className="flex-1 font-semibold text-gray-700">Business Name</Text>
            <Text className="w-24 font-semibold text-gray-700">Status</Text>
            <Text className="w-20 font-semibold text-gray-700 text-center">Actions</Text>
          </View>

          {loading ? (
            <View className="py-8 items-center">
              <Text className="text-gray-500">Loading...</Text>
            </View>
          ) : activeTab === "applications" ? (
            filteredApplications.length > 0 ? (
              filteredApplications.map((app: any, index: number) => {
                const statusInfo = getStatusInfo(app.status)
                return (
                  <View
                    key={app.id}
                    className={`flex-row px-3 py-3 items-center ${index !== filteredApplications.length - 1 ? "border-b border-gray-200" : ""}`}
                  >
                    <View className="flex-1">
                      <Text className="text-gray-800 font-medium">{app.business_name}</Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        Ref: {app.reference} • {getApplicationTypeText(app.type)}
                      </Text>
                      <Text className="text-xs text-gray-500">{formatDate(app.created_timestamp)}</Text>
                      {app.business_id_no && (
                        <Text className="text-xs text-blue-600 mt-1">ID: {app.business_plate_no || app.business_id_no}</Text>
                      )}
                    </View>
                    <Text className={`w-24 text-xs font-medium mr-3 ${statusInfo.color}`}>{statusInfo.text}</Text>
                    <View className="w-20 flex-row justify-center items-center">
                      <Pressable className="w-9 items-center" onPress={() => setSelectedApp(app)}>
                        <Eye size={20} color="#2563eb" />
                      </Pressable>

                      {app.status === 4 && (
                        <Pressable className="w-9 items-center ml-1" onPress={() => handlePayment(app)}>
                          <CreditCard size={20} color="#f97316" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                )
              })
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500">{searchQuery ? "No matching applications found" : "No applications found"}</Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {searchQuery ? "Try a different search term" : "Start by creating a new application"}
                </Text>
              </View>
            )
          ) : filteredClosures.length > 0 ? (
            filteredClosures.map((closure: any, index: number) => {
              const statusInfo = getStatusInfo(closure.status)
              return (
                <View
                  key={closure.id}
                  className={`flex-row px-3 py-3 items-center ${index !== filteredClosures.length - 1 ? "border-b border-gray-200" : ""}`}
                >
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">{closure.business_name}</Text>
                    <Text className="text-xs text-gray-500 mt-1">Ref: {closure.reference}</Text>
                    <Text className="text-xs text-gray-500">{formatDate(closure.created_timestamp)}</Text>
                    {closure.business_id_no && (
                      <Text className="text-xs text-blue-600 mt-1">ID: {closure.business_id_no}</Text>
                    )}
                  </View>
                  <Text className={`w-24 text-xs font-medium mr-3 ${statusInfo.color}`}>{statusInfo.text}</Text>
                  <View className="w-20 flex-row justify-center">
                    <Pressable className="w-9 items-center" onPress={() => setSelectedApp(closure)}>
                      <Eye size={20} color="#2563eb" />
                    </Pressable>
                  </View>
                </View>
              )
            })
          ) : (
            <View className="py-8 items-center">
              <Text className="text-gray-500">
                {searchQuery ? "No matching closure applications found" : "No closure applications found"}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                {searchQuery ? "Try a different search term" : "Closure applications will appear here"}
              </Text>
            </View>
          )}
        </View>

        {/* BOTTOM PAGINATION CONTROLS */}
        {activeTab === "applications" && filteredApplications.length > 0 && !showAll && (
          <View className="bg-white px-4 py-3 rounded-xl shadow-md mt-2 flex-row justify-between items-center">
            <Pressable
              onPress={handlePreviousPage}
              disabled={!canGoPrevious}
              className={`flex-1 py-3 rounded-lg mr-2 ${canGoPrevious ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <Text className={`text-center font-semibold ${canGoPrevious ? "text-white" : "text-gray-500"}`}>← Previous</Text>
            </Pressable>

            <View className="px-4">
              <Text className="text-sm font-bold text-gray-700">Page {currentPage}</Text>
            </View>

            <Pressable
              onPress={handleNextPage}
              disabled={!canGoNext}
              className={`flex-1 py-3 rounded-lg ml-2 ${canGoNext ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <Text className={`text-center font-semibold ${canGoNext ? "text-white" : "text-gray-500"}`}>Next →</Text>
            </Pressable>
          </View>
        )}

        <View className="mt-6 mb-6">
          <Text className="text-center text-white text-xs">Version 0.1</Text>
        </View>
      </ScrollView>



      {/* MODAL: Application Details */}
      <Modal visible={!!selectedApp} transparent animationType="slide" onRequestClose={() => setSelectedApp(null)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-5 w-full max-w-md">
            <Text className="text-lg font-bold text-gray-800 mb-2">{selectedApp?.business_name}</Text>
            <Text className="text-sm text-gray-600 mb-1">Reference: {selectedApp?.reference}</Text>
            <Text className="text-sm text-gray-600 mb-1">
              Type: {selectedApp && getApplicationTypeText(selectedApp.type)}
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Status:
              <Text className={getStatusInfo(selectedApp?.status || 0).color.replace("text-", "text-")}>
                {getStatusInfo(selectedApp?.status || 0).text}
              </Text>
            </Text>

            {/* ✅ Show expiration warning if permit is expired */}
            {selectedApp && expiredPermits.has(selectedApp.id) && (
              <View className="bg-orange-50 border border-orange-300 rounded-lg p-3 mb-3 flex-row items-center">
                <Text className="text-orange-600 text-lg mr-2">⚠️</Text>
                <View className="flex-1">
                  <Text className="text-orange-800 font-semibold text-sm">Permit Expired</Text>
                  <Text className="text-orange-700 text-xs mt-1">
                    This permit has expired and needs to be renewed.
                  </Text>
                </View>
              </View>
            )}

            {/* Icon Grid - 2 rows of 3 icons */}
            <View className="mb-4 mt-4">
              {/* First Row */}
              <View className="flex-row justify-around mb-4">
                {(() => {
                  const firstRowIcons = []

                  // Conditionally add Update/Renew icon
                  if (selectedApp) {
                    const isExpired = expiredPermits.has(selectedApp.id)
                    const canEdit = selectedApp.status === 0 ||
                      selectedApp.status === 1 ||
                      selectedApp.status === 2 ||
                      selectedApp.status === 3 ||
                      selectedApp.status === 4 ||
                      selectedApp.status === 5 ||
                      selectedApp.status === 6 ||
                      selectedApp.status === 23 ||
                      isExpired

                    if (canEdit) {
                      firstRowIcons.push({
                        key: "update",
                        icon: FilePenIcon,
                        label: isExpired ? "Renew" : "Update",
                        color: isExpired ? "#f97316" : "#2563eb",
                      })
                    }
                  }

                  // Always add Application icon
                  firstRowIcons.push({
                    key: "application",
                    icon: FileText,
                    label: "Application",
                    color: "#2563eb",
                  })

                  // Always add Permit icon
                  firstRowIcons.push({
                    key: "permit",
                    icon: IdCard,
                    label: "Permit",
                    color: "#16a34a",
                  })

                  return firstRowIcons.map((item) => (
                    <Pressable
                      key={item.key}
                      className="items-center w-20"
                      onPressIn={() => setActiveIcon(item.key)}
                      onPressOut={() => setActiveIcon(null)}
                      onPress={() => {
                        if (item.key === "application") {
                          handleOpenPDF(selectedApp)
                        } else if (item.key === "permit") {
                          handleOpenPermitPDF(selectedApp)
                        } else if (item.key === "update") {
                          handleUpdateApplication(selectedApp)
                        }
                      }}
                    >
                      <item.icon size={28} color={activeIcon === item.key ? "black" : item.color} />
                      <Text className="text-xs mt-1 text-center">{item.label}</Text>
                    </Pressable>
                  ))
                })()}
              </View>

              {/* Second Row */}
              <View className="flex-row justify-around">
                {[
                  {
                    key: "assessment",
                    icon: ScrollText,
                    label: "Assessment",
                    color: "#eab308",
                  },
                  {
                    key: "attachments",
                    icon: Eye,
                    label: "Attachments",
                    color: "#8b5cf6",
                  },
                  {
                    key: "logs",
                    icon: Newspaper,
                    label: "Logs",
                    color: "#dc2626",
                  },
                ].map((item) => (
                  <Pressable
                    key={item.key}
                    className="items-center w-20"
                    onPressIn={() => setActiveIcon(item.key)}
                    onPressOut={() => setActiveIcon(null)}
                    onPress={() => {
                      if (item.key === "assessment") {
                        handleOpenAssessment(selectedApp)
                      } else if (item.key === "attachments") {
                        handleViewAttachments(selectedApp)
                      } else if (item.key === "logs") {
                        handleOpenLogs(selectedApp)
                      }
                    }}
                  >
                    <item.icon size={28} color={activeIcon === item.key ? "black" : item.color} />
                    <Text className="text-xs mt-1 text-center">{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable onPress={() => setSelectedApp(null)} className="mt-4 bg-gray-200 py-2 rounded-lg">
              <Text className="text-center text-gray-700 font-medium">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* MODAL: Profile */}
      <Modal visible={profileVisible} transparent animationType="fade" onRequestClose={() => setProfileVisible(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-md">
            <Text className="text-lg font-bold text-gray-800 mb-4">Personal Details</Text>
            <Text className="text-gray-700 mb-2">
              Fullname: {user?.firstname} {user?.lastname}
            </Text>
            <Text className="text-gray-700 mb-2">Username: {user?.username}</Text>
            <Text className="text-gray-700 mb-2">Role: {user?.role}</Text>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-700">Password: {showPassword ? user?.password : "********"}</Text>
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="#2563eb" /> : <Eye size={18} color="#2563eb" />}
              </Pressable>
            </View>
            <Pressable onPress={handleLogout} className="bg-red-500 py-2 rounded-lg mb-2">
              <Text className="text-center text-white font-semibold">Logout</Text>
            </Pressable>
            <Pressable onPress={() => setProfileVisible(false)} className="bg-gray-200 py-2 rounded-lg">
              <Text className="text-center text-gray-700 font-medium">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL: Application Logs */}
      <Modal visible={logsVisible} transparent animationType="slide" onRequestClose={() => setLogsVisible(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl w-full max-w-2xl max-h-[80%] overflow-hidden">
            {/* Updated Header - Red Background */}
            <View className="bg-red-600 px-5 py-4 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Newspaper size={24} color="white" />
                <Text className="text-lg font-bold text-white ml-2">Application Logs</Text>
              </View>
              <Pressable
                onPress={() => setLogsVisible(false)}
                className="bg-white/20 rounded-full w-8 h-8 items-center justify-center"
              >
                <Text className="text-white text-xl font-bold">×</Text>
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView className="px-5 py-4">
              {loadingLogs ? (
                <View className="py-8 items-center">
                  <Text className="text-gray-500">Loading logs...</Text>
                </View>
              ) : applicationLogs.length > 0 ? (
                <View>
                  <Text className="text-sm text-gray-600 mb-4">
                    Total Logs: {applicationLogs.length}
                  </Text>

                  {applicationLogs.map((log, index) => (
                    <View
                      key={log.id}
                      className={`mb-4 border-l-4 ${getActionColor(log.action).replace('bg-', 'border-')} pl-4 pb-4 ${index !== applicationLogs.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                    >
                      {/* Action Badge */}
                      <View className="flex-row items-center mb-2">
                        <View className={`${getActionColor(log.action)} px-3 py-1 rounded-full`}>
                          <Text className="text-white text-xs font-bold">{log.action}</Text>
                        </View>
                        <Text className="text-xs text-gray-500 ml-2">
                          {formatTimestampPhilippine(log.timestamp)}
                        </Text>
                      </View>

                      {/* Description */}
                      {log.description && (
                        <Text className="text-sm text-gray-800 mb-2">{log.description}</Text>
                      )}

                      {/* User Info - Using the "by" field from backend */}
                      <View className="flex-row items-center mt-1">
                        <Text className="text-xs text-gray-600">
                          By: <Text className="font-semibold">{log.by || log.fullName || log.username}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Newspaper size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">No logs available</Text>
                  <Text className="text-xs text-gray-400 mt-1">Activity logs will appear here</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View className="px-5 py-3 border-t border-gray-200 bg-gray-50">
              <Pressable
                onPress={() => setLogsVisible(false)}
                className="bg-gray-300 py-3 rounded-lg active:bg-gray-400"
              >
                <Text className="text-center text-gray-700 font-semibold">Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: View Attachments */}
      <Modal visible={attachmentsVisible} transparent animationType="slide" onRequestClose={() => setAttachmentsVisible(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl w-full max-w-2xl max-h-[80%]">
            {/* Header */}
            <View className="bg-red-600 rounded-t-xl px-5 py-4 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Eye size={24} color="white" />
                <Text className="text-lg font-bold text-white ml-2">Application Attachments</Text>
              </View>
              <Pressable onPress={() => setAttachmentsVisible(false)}>
                <Text className="text-white text-2xl font-bold">×</Text>
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView className="px-5 py-4">
              {loadingAttachments ? (
                <View className="py-8 items-center">
                  <Text className="text-gray-500">Loading attachments...</Text>
                </View>
              ) : applicationAttachments.length > 0 ? (
                <View>
                  <Text className="text-sm text-gray-600 mb-4">
                    Total Attachments: {applicationAttachments.length}
                  </Text>

                  {applicationAttachments.map((att, index) => (
                    <View
                      key={att.attachmentId}
                      className={`mb-3 p-4 bg-gray-50 rounded-lg ${index !== applicationAttachments.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1 mr-3">
                          <Text className="text-sm font-semibold text-gray-800">{att.filename}</Text>
                          <Text className="text-xs text-gray-500 mt-1">Tap to view</Text>
                        </View>

                        <Pressable
                          onPress={() => handleViewAttachmentFile(att.attachmentId, att.filename)}
                          className="bg-green-500 rounded px-4 py-2"
                        >
                          <Text className="text-white font-semibold text-xs">View</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Eye size={48} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">No attachments available</Text>
                  <Text className="text-xs text-gray-400 mt-1">No files were uploaded for this application</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View className="px-5 py-3 border-t border-gray-200">
              <Pressable onPress={() => setAttachmentsVisible(false)} className="bg-gray-200 py-3 rounded-lg">
                <Text className="text-center text-gray-700 font-medium">Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Year Filter */}
      <Modal
        visible={yearFilterVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearFilterVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-xl w-full max-w-md">
            {/* Header */}
            <View className="bg-red-600 rounded-t-xl px-5 py-4 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Settings size={24} color="white" />
                <Text className="text-lg font-bold text-white ml-2">Filter by Year</Text>
              </View>
              <Pressable onPress={() => setYearFilterVisible(false)}>
                <Text className="text-white text-2xl font-bold">×</Text>
              </Pressable>
            </View>

            {/* Content */}
            <View className="p-6">
              <Text className="text-sm text-gray-600 mb-4">Year to Display</Text>

              {/* All Option */}
              <Pressable
                onPress={() => setYearFilter('all')}
                className="flex-row items-center mb-4"
              >
                <View className={`w-5 h-5 rounded-full border-2 ${yearFilter === 'all' ? 'border-blue-600' : 'border-gray-400'
                  } items-center justify-center mr-3`}>
                  {yearFilter === 'all' && (
                    <View className="w-3 h-3 rounded-full bg-blue-600" />
                  )}
                </View>
                <Text className="text-gray-800 text-base">All Years</Text>
              </Pressable>

              {/* Current Option */}
              <Pressable
                onPress={() => setYearFilter('current')}
                className="flex-row items-center mb-4"
              >
                <View className={`w-5 h-5 rounded-full border-2 ${yearFilter === 'current' ? 'border-blue-600' : 'border-gray-400'
                  } items-center justify-center mr-3`}>
                  {yearFilter === 'current' && (
                    <View className="w-3 h-3 rounded-full bg-blue-600" />
                  )}
                </View>
                <Text className="text-gray-800 text-base">
                  Current Year ({new Date().getFullYear()})
                </Text>
              </Pressable>

              {/* Specific Option */}
              <Pressable
                onPress={() => setYearFilter('specific')}
                className="flex-row items-center mb-3"
              >
                <View className={`w-5 h-5 rounded-full border-2 ${yearFilter === 'specific' ? 'border-blue-600' : 'border-gray-400'
                  } items-center justify-center mr-3`}>
                  {yearFilter === 'specific' && (
                    <View className="w-3 h-3 rounded-full bg-blue-600" />
                  )}
                </View>
                <Text className="text-gray-800 text-base">Specific Year</Text>
              </Pressable>

              {/* Year Input */}
              {yearFilter === 'specific' && (
                <View className="ml-8 mt-2">
                  <TextInput
                    value={specificYear}
                    onChangeText={setSpecificYear}
                    placeholder="Enter year (e.g., 2024)"
                    keyboardType="numeric"
                    maxLength={4}
                    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              )}
            </View>

            {/*  UPDATED Footer */}
            <View className="flex-row p-4 border-t border-gray-200 gap-2">
              <Pressable
                onPress={() => {
                  setYearFilter('all')
                  setSpecificYear(new Date().getFullYear().toString())
                  setCurrentPage(1) 
                  setYearFilterVisible(false)
                  
                }}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-semibold">Reset</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setCurrentPage(1) 
                  setYearFilterVisible(false)
                  
                }}
                className="flex-1 bg-blue-600 py-3 rounded-lg"
              >
                <Text className="text-center text-white font-semibold">Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Custom Alert with Bell Icon on Right - Fully Centered Text */}
      <Modal
        visible={customAlert.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            {/*  Header with Bell Icon on Right Side */}
            <View className="bg-white px-6 pt-8 pb-6 relative">
              {/*  Bell Icon - Absolute Position on Right */}
              <View className="absolute top-6 right-6 bg-red-100 rounded-full p-3">
                <Bell size={17} color="#dc2626" strokeWidth={2.3} />
              </View>

              {/*  Content Fully Centered - No padding adjustment */}
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {customAlert.title}
                </Text>

                <Text className="text-base text-gray-700 leading-6 text-center">
                  {customAlert.message}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View className="border-t border-gray-200">
              {customAlert.buttons && customAlert.buttons.length > 0 && (
                <View className={`flex-row ${customAlert.buttons.length === 1 ? '' : 'divide-x divide-gray-200'}`}>
                  {customAlert.buttons.map((button, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        setCustomAlert(prev => ({ ...prev, visible: false }))
                        if (button.onPress) {
                          setTimeout(() => button.onPress?.(), 100)
                        }
                      }}
                      className={`flex-1 py-4 ${button.style === 'destructive' ? 'bg-red-50' : 'bg-white'
                        } active:bg-gray-100`}
                    >
                      <Text
                        className={`text-center font-semibold text-base ${button.style === 'destructive'
                            ? 'text-red-600'
                            : button.style === 'cancel'
                              ? 'text-gray-600'
                              : 'text-blue-600'
                          }`}
                      >
                        {button.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: Attachment Viewer */}
      <Modal visible={viewingAttachment !== null} animationType="slide" transparent>
        <View className="flex-1 bg-black/90">
          <View className="flex-1 bg-white m-4 mt-12 rounded-lg overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-red-600">
              <Text className="font-bold text-lg flex-1 text-white" numberOfLines={1}>
                {viewingAttachment?.filename}
              </Text>
              <Pressable
                onPress={() => setViewingAttachment(null)}
                className="ml-2 bg-white rounded px-3 py-1"
              >
                <Text className="text-red-600 font-semibold">Close</Text>
              </Pressable>
            </View>

            <ScrollView className="flex-1 p-4">
              {viewingAttachment?.contentType.startsWith('image/') ? (
                <Image
                  source={{
                    uri: `data:${viewingAttachment.contentType};base64,${viewingAttachment.data}`
                  }}
                  style={{ width: '100%', height: 400 }}
                  resizeMode="contain"
                />
              ) : (
                <View className="items-center justify-center p-8">
                  <Text className="text-gray-600 text-center mb-2">
                    {viewingAttachment?.contentType === 'application/pdf'
                      ? '📄 PDF Document'
                      : '📎 Document'}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    File size: {((viewingAttachment?.size || 0) / 1024).toFixed(2)} KB
                  </Text>
                  <Text className="text-gray-400 text-xs mt-4">
                    Preview not available for this file type
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL: QR Scanner */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => {
          setShowScanner(false);
          setScanned(false);
        }}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 pt-12 pb-4 px-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-xl font-bold">Scan QR Code</Text>
              <Pressable
                onPress={() => {
                  setShowScanner(false);
                  setScanned(false);
                }}
                className="bg-white/20 rounded-full p-2"
              >
                <X color="#fff" size={24} />
              </Pressable>
            </View>
            <Text className="text-white/80 text-sm mt-2">Scan the QR code on your business permit</Text>
          </View>

          {/* Camera View */}
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          >
            {/* Scanning Frame */}
            <View className="flex-1 items-center justify-center">
              <View
                className="border-4 border-white rounded-3xl"
                style={{ width: 250, height: 250 }}
              >
                {/* Corner decorations */}
                <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl" />
                <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl" />
                <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl" />
                <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl" />
              </View>
            </View>

            {/* Instructions */}
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-6">
              <View className="bg-white/10 rounded-xl p-4">
                <Text className="text-white text-center font-semibold text-base mb-2">
                  How to scan:
                </Text>
                <Text className="text-white/80 text-center text-sm">
                  1. Hold your phone steady{"\n"}
                  2. Align the QR code within the frame{"\n"}
                  3. Wait for automatic detection
                </Text>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
      {/* BOTTOM MENU */}
      <View className="flex-row justify-around items-center py-2 bg-white border-t border-gray-200 shadow-lg">
        <Pressable className="items-center flex-1">
          <HomeIcon size={22} color="#2563eb" />
          <Text className="text-xs text-blue-600 font-semibold">Home</Text>
        </Pressable>
        <Pressable className="items-center flex-1">
          <Newspaper size={22} color="#6b7280" />
          <Text className="text-xs text-gray-500">Chat</Text>
        </Pressable>
        <Pressable className="items-center flex-1" onPress={handleScanQR}>
          <QrCode size={22} color="#6b7280" />
          <Text className="text-xs text-gray-500">Scan</Text>
        </Pressable>
        <Pressable className="items-center flex-1" onPress={() => router.push("/transaction")}>
          <IdCard size={22} color="#6b7280" />
          <Text className="text-xs text-gray-500">Transactions</Text>
        </Pressable>
        <Pressable className="items-center flex-1" onPress={() => router.push("/profile")}>
          <UserRoundCog size={22} color="#6b7280" />
          <Text className="text-xs text-gray-500">Profile</Text>
        </Pressable>
      </View>
    </LinearGradient>
  )
}
