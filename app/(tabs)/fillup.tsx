import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { getApiUrl } from "../utils/api";

import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Eye, Plus, Trash2 } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, FlatList, Image, KeyboardTypeOptions, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

type ApplicationType = "new" | "renew";
type PaymentMode = "annual" | "bi-annual" | "quarterly";
type Gender = "male" | "female";
type Owned = "yes" | "no" | "notspecified";
type BusinessType =
  | "sole proprietorship"
  | "partnership"
  | "corporation"
  | "cooperative"
  | "one person corporation"
  | "association";

type businessActivity =
  | "Main Office"
  | "BranchOffice"
  | "AdminOfficeOnly"
  | "Warehouse"
  | "Others";

interface Region {
  id: number;
  name: string;
  description: string;
}

interface Province {
  id: number;
  code: string;
  name: string;
}

interface Municipality {
  id: number;
  code: string;
  name: string;
}

interface Barangay {
  id: number;
  name: string;
  zipcode: string;
}

interface MunicipalityAttachment {
  id: number;
  municipalityId: number;
  title: string;
  description: string;
  required: number;
  permit: number;
  closure: number;
  active: number;
}

interface BusinessLineResult {
  id: number;
  code: string;
  name: string;
  description: string;
  classCode: string;
  className: string;
  groupCode: string;
  groupName: string;
  divisionCode: string;
  divisionName: string;
  sectionCode: string;
  sectionName: string;
  hasTerm: boolean;
  termId: number;
  classification?: string;
}

interface BusinessLine {
  id: number;
  code: string;
  name: string;
  description: string;
  hasTerm: boolean;
  termId: number;
  classification: string;
  units: string;
  capital: string;
  essential: string;
  nonEssential: string;
  registrationNumber: string;
  expiration: string;
}

interface MeasureData {
  businessLineId: string;
  measureId: string;
  units: string;
  capacity: string;
  measureName: string;
  lineBusiness: string;
}
interface MunicipalityMeasure {
  id: number;
  municipalityId: number;
  name: string;
  description: string;
  active: number;
}

const Fillup = () => {
  const router = useRouter();

  const isMountedRef = useRef(true);

  const [applicationType, setApplicationType] = useState<ApplicationType>("new");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("annual");
  const [gender, setGender] = useState<Gender>("male");



  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [suffix, setSuffix] = useState("");
  const [mobile, setMobile] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [traderName, setTraderName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("sole proprietorship");
  const [businessActivity, setBusinessActivity] = useState<businessActivity>("Main Office");
  const [registrationNo, setRegistrationNo] = useState("");
  const [tin, setTin] = useState("");
  const [taxDeclaration, setTaxDeclaration] = useState("");
  const [propertyIndex, setPropertyIndex] = useState("");

  // Taxpayer Address
  const [region, setRegion] = useState("");
  const [regionId, setRegionId] = useState<number | null>(null);
  const [province, setProvince] = useState("");
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [municipality, setMunicipality] = useState("");
  const [municipalityId, setMunicipalityId] = useState<number | null>(null);
  const [barangay, setBarangay] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [lotNo, setLotNo] = useState("");
  const [blockNo, setBlockNo] = useState("");
  const [street, setStreet] = useState("");
  const [subdivision, setSubdivision] = useState("");

  // Main Office Address
  const [bisRegion, setBisRegion] = useState("");
  const [bisRegionId, setBisRegionId] = useState<number | null>(null);
  const [bisProvince, setBisProvince] = useState("");
  const [bisProvinceId, setBisProvinceId] = useState<number | null>(null);
  const [bisMunicipality, setBisMunicipality] = useState("");
  const [bisMunicipalityId, setBisMunicipalityId] = useState<number | null>(null);
  const [bisBarangay, setBisBarangay] = useState("");
  const [bisZipcode, setBisZipcode] = useState("");
  const [bisHouseNo, setBisHouseNo] = useState("");
  const [bisBuildingName, setBisBuildingName] = useState("");
  const [bislotNo, setBisLotNo] = useState("");
  const [bisBlockNo, setBisBlockNo] = useState("");
  const [bisStreet, setBisStreet] = useState("");
  const [bisSubdivision, setBisSubdivision] = useState("");
  const [sameAsPayer, setSameAsPayer] = useState(false);

  // Business Location Address
  const [locRegion, setLocRegion] = useState("");
  const [locRegionId, setLocRegionId] = useState<number | null>(null);
  const [locProvince, setLocProvince] = useState("");
  const [locProvinceId, setLocProvinceId] = useState<number | null>(null);
  const [locMunicipality, setLocMunicipality] = useState("");
  const [locMunicipalityId, setLocMunicipalityId] = useState<number | null>(null);
  const [locBarangay, setLocBarangay] = useState("");
  const [locZipcode, setLocZipcode] = useState("");
  const [locHouseNo, setLocHouseNo] = useState("");
  const [locBuildingName, setLocBuildingName] = useState("");
  const [loclotNo, setLocLotNo] = useState("");
  const [locBlockNo, setLocBlockNo] = useState("");
  const [locStreet, setLocStreet] = useState("");
  const [locSubdivision, setLocSubdivision] = useState("");
  const [sameAsMain, setSameAsMain] = useState(false);

  // Contact Info
  const [contactLastname, setContactLastname] = useState("");
  const [contactFirstname, setContactFirstname] = useState("");
  const [contactMiddlename, setContactMiddlename] = useState("");
  const [contactSuffix, setContactSuffix] = useState("");
  const [contactMobileNumber, setContactMobileNumber] = useState("");
  const [contactTelephoneNumber, setContactTelephoneNumber] = useState("");

  // Lease info
  const [lesName, setLesName] = useState("");
  const [lesAmount, setLesAmount] = useState("");

  // Business Operation Quantity
  const [businessArea, setBusinessArea] = useState("");
  const [floorArea, setFloorArea] = useState("");
  const [employeeFemale, setEmployeeFemale] = useState("");
  const [employeeMale, setEmployeeMale] = useState("");
  const [employeeLgu, setEmployeeLgu] = useState("");
  const [vanTruck, setVanTruck] = useState("");
  const [motorycle, setMotorcycle] = useState("");
  const [owned, setOwned] = useState<Owned>("yes");

  // Municipality Attachments
  const [municipalityAttachments, setMunicipalityAttachments] = useState<MunicipalityAttachment[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, {
    filename: string;
    fileData: string;
    fileType: string;
  }>>({});

  const [viewingAttachment, setViewingAttachment] = useState<{
    filename: string;
    contentType: string;
    data: string;
    size: number;
  } | null>(null);

  const [existingAttachments, setExistingAttachments] = useState<Array<{
    attachmentId: number;
    filename: string;
    url: string;
    base64Url: string;
  }>>([]);

  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);


  // Add refs for input focus
  const taxDeclarationRef = useRef<TextInput>(null);
  const propertyIndexRef = useRef<TextInput>(null);
  const businessAreaRef = useRef<TextInput>(null);

  const leaseAreaRef = useRef<TextInput>(null);

  // Business Line
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [businessModalVisible, setBusinessModalVisible] = useState(false);
  const [businessLineResults, setBusinessLineResults] = useState<BusinessLineResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Measures and Pax
  const [units, setUnits] = useState("");
  const [capacity, setCapacity] = useState("");
  const [measure, setMeasure] = useState("");
  const [measureModalVisible, setMeasureModalVisible] = useState(false);
  const [lineBusiness, setLineBusiness] = useState("");

  const [measures, setMeasures] = useState<MeasureData[]>([]);
  const [measureId, setMeasureId] = useState("");

  // only view when status is 6
  const [applicationStatus, setApplicationStatus] = useState<number>(0);

  const [municipalityMeasures, setMunicipalityMeasures] = useState<MunicipalityMeasure[]>([]);
  const [selectedBusinessLineId, setSelectedBusinessLineId] = useState("");

  // Dropdown data
  const [regions, setRegions] = useState<Region[]>([]);
  const [taxpayerProvinces, setTaxpayerProvinces] = useState<Province[]>([]);
  const [taxpayerMunicipalities, setTaxpayerMunicipalities] = useState<Municipality[]>([]);
  const [taxpayerBarangays, setTaxpayerBarangays] = useState<Barangay[]>([]);
  const [businessProvinces, setBusinessProvinces] = useState<Province[]>([]);
  const [businessMunicipalities, setBusinessMunicipalities] = useState<Municipality[]>([]);
  const [businessBarangays, setBusinessBarangays] = useState<Barangay[]>([]);
  const [locationProvinces, setLocationProvinces] = useState<Province[]>([]);
  const [locationMunicipalities, setLocationMunicipalities] = useState<Municipality[]>([]);
  const [locationBarangays, setLocationBarangays] = useState<Barangay[]>([]);

  // for renewal
  const [isRenewalMode, setIsRenewalMode] = useState(false)
  const [linkBusinessNo, setLinkBusinessNo] = useState("")
  const [businessIdNo, setBusinessIdNo] = useState("")

  // update application
  const { applicationId, mode, timestamp } = useLocalSearchParams<{
    applicationId?: string;
    mode?: string;
    timestamp?: string;
  }>();
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isLoadingApplication, setIsLoadingApplication] = useState(false);


  const [barangayId, setBarangayId] = useState<number | null>(null);
  const [bisBarangayId, setBisBarangayId] = useState<number | null>(null);
  const [locBarangayId, setLocBarangayId] = useState<number | null>(null);

  const [isLoadingData, setIsLoadingData] = useState(false);

  // for submiting loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearAllFormData = () => {
    // Application Type & Payment
    setApplicationType("new");
    setPaymentMode("annual");
    setGender("male");

    // Taxpayer Personal Info
    setLastname("");
    setFirstname("");
    setMiddlename("");
    setSuffix("");
    setMobile("");
    setTelephone("");
    setEmail("");

    // Business Information
    setBusinessName("");
    setTraderName("");
    setBusinessType("sole proprietorship");
    setBusinessActivity("Main Office");
    setRegistrationNo("");
    setTin("");
    setTaxDeclaration("");
    setPropertyIndex("");

    // Taxpayer Address
    setRegion("");
    setRegionId(null);
    setProvince("");
    setProvinceId(null);
    setMunicipality("");
    setMunicipalityId(null);
    setBarangay("");
    setBarangayId(null);
    setZipcode("");
    setHouseNo("");
    setBuildingName("");
    setLotNo("");
    setBlockNo("");
    setStreet("");
    setSubdivision("");

    // Main Office Address
    setBisRegion("");
    setBisRegionId(null);
    setBisProvince("");
    setBisProvinceId(null);
    setBisMunicipality("");
    setBisMunicipalityId(null);
    setBisBarangay("");
    setBisBarangayId(null);
    setBisZipcode("");
    setBisHouseNo("");
    setBisBuildingName("");
    setBisLotNo("");
    setBisBlockNo("");
    setBisStreet("");
    setBisSubdivision("");
    setSameAsPayer(false);

    // Business Location Address
    setLocRegion("");
    setLocRegionId(null);
    setLocProvince("");
    setLocProvinceId(null);
    setLocMunicipality("");
    setLocMunicipalityId(null);
    setLocBarangay("");
    setLocBarangayId(null);
    setLocZipcode("");
    setLocHouseNo("");
    setLocBuildingName("");
    setLocLotNo("");
    setLocBlockNo("");
    setLocStreet("");
    setLocSubdivision("");
    setSameAsMain(false);

    // Contact Info
    setContactLastname("");
    setContactFirstname("");
    setContactMiddlename("");
    setContactSuffix("");
    setContactMobileNumber("");
    setContactTelephoneNumber("");

    // Lease Info
    setLesName("");
    setLesAmount("");

    // Business Operation Quantity
    setBusinessArea("");
    setFloorArea("");
    setEmployeeFemale("");
    setEmployeeMale("");
    setEmployeeLgu("");
    setVanTruck("");
    setMotorcycle("");
    setOwned("yes");

    // Business Lines & Measures
    setBusinessLines([]);
    setMeasures([]);

    // Attachments
    setUploadedFiles({});
    setExistingAttachments([]);
    setDeletedAttachmentIds([]);

    // Search/Modal States
    setSearchQuery("");
    setBusinessLineResults([]);
    setBusinessModalVisible(false);
    setMeasureModalVisible(false);
    setUnits("");
    setCapacity("");
    setMeasure("");
    setMeasureId("");
    setLineBusiness("");
    setSelectedBusinessLineId("");

    // Renewal/Update States
    setIsRenewalMode(false);
    setLinkBusinessNo("");
    setBusinessIdNo("");
    setIsUpdateMode(false);
    setApplicationStatus(0);

    // Clear dropdown arrays
    setTaxpayerProvinces([]);
    setTaxpayerMunicipalities([]);
    setTaxpayerBarangays([]);
    setBusinessProvinces([]);
    setBusinessMunicipalities([]);
    setBusinessBarangays([]);
    setLocationProvinces([]);
    setLocationMunicipalities([]);
    setLocationBarangays([]);

    console.log("✅ All form data cleared successfully");
  };


  const [loading, setLoading] = useState(true);


  // Track mount/unmount 
  useEffect(() => {
    console.log("Componnete Mounted");
    isMountedRef.current = true;

    return () => {
      console.log("Component Unmounting");
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Taxpayer cascading effects
  // REPLACE Taxpayer Region -> Provinces
  useEffect(() => {
    if (!regionId || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchProvinces(regionId, 'taxpayer', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch provinces error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [regionId, isLoadingData]);

  // REPLACE Taxpayer Province -> Municipalities
  useEffect(() => {
    if (!provinceId || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchMunicipalities(provinceId, 'taxpayer', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch municipalities error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [provinceId, isLoadingData]);

  // REPLACE Taxpayer Municipality -> Barangays
  useEffect(() => {
    if (!municipalityId || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchBarangays(municipalityId, 'taxpayer', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch barangays error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [municipalityId, isLoadingData]);

  // Location cascading effects
  // REPLACE Location Region -> Provinces
  useEffect(() => {
    if (!locRegionId || sameAsMain || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchProvinces(locRegionId, 'location', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch location provinces error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [locRegionId, sameAsMain, isLoadingData]);

  // ✅ REPLACE Location Province -> Municipalities
  useEffect(() => {
    if (!locProvinceId || sameAsMain || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchMunicipalities(locProvinceId, 'location', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch location municipalities error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [locProvinceId, sameAsMain, isLoadingData]);

  // ✅ REPLACE Location Municipality -> Barangays
  useEffect(() => {
    if (!locMunicipalityId || sameAsMain || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchBarangays(locMunicipalityId, 'location', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch location barangays error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [locMunicipalityId, sameAsMain, isLoadingData]);

  // ✅ REPLACE Business Region -> Provinces
  useEffect(() => {
    if (!bisRegionId || sameAsPayer || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchProvinces(bisRegionId, 'business', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch business provinces error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [bisRegionId, sameAsPayer, isLoadingData]);

  // ✅ REPLACE Business Province -> Municipalities
  useEffect(() => {
    if (!bisProvinceId || sameAsPayer || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchMunicipalities(bisProvinceId, 'business', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch business municipalities error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [bisProvinceId, sameAsPayer, isLoadingData]);

  // ✅ REPLACE Business Municipality -> Barangays
  useEffect(() => {
    if (!bisMunicipalityId || sameAsPayer || isLoadingData || isLoadingApplication) return;

    const abortController = new AbortController();

    fetchBarangays(bisMunicipalityId, 'business', abortController.signal)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Fetch business barangays error:', err);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [bisMunicipalityId, sameAsPayer, isLoadingData]);

  const fetchInitialData = async () => {
    try {
      safeSetState(setLoading, true); // Use safeSetState

      const API_URL = await getApiUrl();
      const regionsResponse = await axios.get(`${API_URL}/regions`, {
        timeout: 10000 // Add timeout
      });

      if (!isMountedRef.current) return; // Check mount status

      safeSetState(setRegions, regionsResponse.data);

      const defaultsResponse = await axios.get(`${API_URL}/addresses/defaults`, {
        timeout: 10000 // ✅ Add timeout
      });

      if (!isMountedRef.current) return; // ✅ Check mount status

      const defaults = defaultsResponse.data;

      if (defaults.defaultRegion) {
        const defaultReg = regionsResponse.data.find(
          (r: Region) => r.name === defaults.defaultRegion
        );
        if (defaultReg && isMountedRef.current) { // ✅ Check mount status
          safeSetState(setRegion, defaultReg.name);
          safeSetState(setRegionId, defaultReg.id);
          safeSetState(setBisRegion, defaultReg.name);
          safeSetState(setBisRegionId, defaultReg.id);
        }
      }

      const attachmentsResponse = await axios.get(`${API_URL}/municipality/attachments`, {
        timeout: 10000 // ✅ Add timeout
      });

      if (!isMountedRef.current) return; // ✅ Check mount status

      if (attachmentsResponse.data.attachments) {
        safeSetState(setMunicipalityAttachments, attachmentsResponse.data.attachments);
      }

      await fetchMunicipalityMeasures();
    } catch (error) {
      console.error("Error fetching initial data:", error);

      if (!isMountedRef.current) return; // ✅ Check mount status

      Alert.alert("Error", "Failed to load address data. Please try again.");
    } finally {
      if (isMountedRef.current) { // ✅ Check mount status
        safeSetState(setLoading, false);
      }
    }
  };


  // Safe state update wrapper
  const safeSetState = useCallback((setter: Function, value: any) => {
    if (isMountedRef.current) {
      try {
        setter(value);
      } catch (error) {
        console.error("State update error:", error);
      }
    } else {
      console.warn("Attempted state update on unmounted component");
    }
  }, []);

  // Add this useEffect after fetchInitialData useEffect
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Leave Form?",
        "Are you sure you want to go back? All unsaved changes will be lost.",
        [
          {
            text: "Stay",
            style: "cancel",
            onPress: () => null
          },
          {
            text: "Leave",
            style: "destructive",
            onPress: () => {
              clearAllFormData();
              router.replace("/(tabs)/home");
            }
          }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Add this helper function at the top of your component
  const isReleased = () => {
    const status = Number(applicationStatus);
    const isReleasedStatus = status === 6;

    // NEW: If renewal mode, allow editing regardless of status
    if (isRenewalMode) {
      console.log("📝 Renewal mode: All fields editable");
      return false;
    }

    console.log("📝 isReleased check:", {
      applicationStatus,
      status,
      isUpdateMode,
      isReleasedStatus,
      result: isUpdateMode && isReleasedStatus
    });
    return isUpdateMode && isReleasedStatus;
  };
  // Add this right after your imports and before the Fillup component
  const StyledTextInput = React.memo(
    React.forwardRef<TextInput, any>((props, ref) => (
      <TextInput
        ref={ref}
        {...props}
        placeholderTextColor={props.placeholderTextColor || "#9ca3af"}
        style={[
          { color: '#1f2937' },
          props.style
        ]}
      />
    ))
  );

  // Add this after StyledTextInput definition
  const StyledPicker = ({ children, ...props }: any) => (
    <View style={{ backgroundColor: '#ffffff' }}>
      <Picker
        {...props}
        style={{
          color: '#1f2937',
          backgroundColor: '#ffffff',
        }}
        itemStyle={{
          color: '#1f2937',
          backgroundColor: '#ffffff',
        }}
      >
        {children}
      </Picker>
    </View>
  );

  // Modify fetchApplicationForEdit to detect renewal
  const fetchApplicationForEdit = async (appId: string, signal?: AbortSignal) => {
    try {
      setIsLoadingApplication(true);
      setIsLoadingData(true);
      const API_URL = await getApiUrl();
      // Check if aborted
      if (signal?.aborted) {
        console.log("Fetch aborted before API call");
        return;
      }
      const response = await axios.get(`${API_URL}/applications/${appId}/edit`, {
        withCredentials: true,
        timeout: 30000,
        signal
      });

      // Check if aborted after API call
      if (signal?.aborted) {
        console.log("Fetch aborted after API call");
        return;
      }

      const data = response.data;
      console.log("Fetched application data:", data);

      // ✅ SET APPLICATION STATUS
      if (data.status !== undefined && data.status !== null) {
        setApplicationStatus(data.status);
        console.log("✅ Status set to:", data.status);
      }

      // ✅ NEW: Check if this is a renewal
      if (data.isRenewal || data.isExpired) {
        console.log("🔄 RENEWAL MODE DETECTED");
        setIsRenewalMode(true);

        // Get link_business_no
        if (data.linkBusinessNo) {
          setLinkBusinessNo(data.linkBusinessNo);
          console.log("Link Business No:", data.linkBusinessNo);
        }
        //  ADD THIS HERE - Get business_permit_no
        if (data.businessIdNo) {
          setBusinessIdNo(data.businessIdNo);
          console.log("Business Id No:", data.businessIdNo);
        }
      } else {
        setIsRenewalMode(false);
      }

      // Populate form fields (keep all existing code)
      setApplicationType(data.type === 1 ? "new" : "renew");
      setPaymentMode(data.paymentMode === 0 ? "annual" : data.paymentMode === 1 ? "bi-annual" : "quarterly");
      setBusinessName(data.businessName || "");
      setTraderName(data.traderName || "");
      setBusinessType(mapBusinessTypeFromAPI(data.businessType));
      setBusinessActivity(mapBusinessActivityFromAPI(data.businessActivity));
      setRegistrationNo(data.permitNumber || "");
      setTin(data.taxNumber || "");
      setTaxDeclaration(data.taxDeclaration || "");
      setPropertyIndex(data.propertyIndex || "");

      // Payer information (keep existing code)
      if (data.payer) {
        setLastname(data.payer.lastname || "");
        setFirstname(data.payer.firstname || "");
        setMiddlename(data.payer.middlename || "");
        setSuffix(data.payer.suffix || "");
        setMobile(data.payer.mobile || "");
        setTelephone(data.payer.telephone || "");
        setEmail(data.payer.email || "");
        setGender(data.payer.gender === 0 ? "male" : "female");
      }

      // Store address data temporarily for comparison
      let payerAddressData = null;
      let mainOfficeAddressData = null;
      let businessLocationAddressData = null;

      // Addresses
      if (data.addresses) {
        // Payer Address
        if (data.addresses.payer) {
          await loadAddressFromBarangayId(data.addresses.payer.barangayId, 'taxpayer', signal);
          setHouseNo(data.addresses.payer.unitNumber || "");
          setBuildingName(data.addresses.payer.buildingName || "");
          setLotNo(data.addresses.payer.lotNumber || "");
          setBlockNo(data.addresses.payer.blockNumber || "");
          setStreet(data.addresses.payer.street || "");
          setSubdivision(data.addresses.payer.subdivision || "");

          payerAddressData = {
            barangayId: data.addresses.payer.barangayId,
            unitNumber: data.addresses.payer.unitNumber || "",
            buildingName: data.addresses.payer.buildingName || "",
            lotNumber: data.addresses.payer.lotNumber || "",
            blockNumber: data.addresses.payer.blockNumber || "",
            street: data.addresses.payer.street || "",
            subdivision: data.addresses.payer.subdivision || ""
          };
        }

        // Main Office Address
        if (data.addresses.mainOffice) {
          await loadAddressFromBarangayId(data.addresses.mainOffice.barangayId, 'business', signal);
          setBisHouseNo(data.addresses.mainOffice.unitNumber || "");
          setBisBuildingName(data.addresses.mainOffice.buildingName || "");
          setBisLotNo(data.addresses.mainOffice.lotNumber || "");
          setBisBlockNo(data.addresses.mainOffice.blockNumber || "");
          setBisStreet(data.addresses.mainOffice.street || "");
          setBisSubdivision(data.addresses.mainOffice.subdivision || "");

          mainOfficeAddressData = {
            barangayId: data.addresses.mainOffice.barangayId,
            unitNumber: data.addresses.mainOffice.unitNumber || "",
            buildingName: data.addresses.mainOffice.buildingName || "",
            lotNumber: data.addresses.mainOffice.lotNumber || "",
            blockNumber: data.addresses.mainOffice.blockNumber || "",
            street: data.addresses.mainOffice.street || "",
            subdivision: data.addresses.mainOffice.subdivision || ""
          };
        }

        // Business Location Address
        if (data.addresses.businessLocation) {
          await loadAddressFromBarangayId(data.addresses.businessLocation.barangayId, 'location', signal);
          setLocHouseNo(data.addresses.businessLocation.unitNumber || "");
          setLocBuildingName(data.addresses.businessLocation.buildingName || "");
          setLocLotNo(data.addresses.businessLocation.lotNumber || "");
          setLocBlockNo(data.addresses.businessLocation.blockNumber || "");
          setLocStreet(data.addresses.businessLocation.street || "");
          setLocSubdivision(data.addresses.businessLocation.subdivision || "");

          businessLocationAddressData = {
            barangayId: data.addresses.businessLocation.barangayId,
            unitNumber: data.addresses.businessLocation.unitNumber || "",
            buildingName: data.addresses.businessLocation.buildingName || "",
            lotNumber: data.addresses.businessLocation.lotNumber || "",
            blockNumber: data.addresses.businessLocation.blockNumber || "",
            street: data.addresses.businessLocation.street || "",
            subdivision: data.addresses.businessLocation.subdivision || ""
          };
        }
      }

      // Check if addresses match and set checkboxes accordingly
      if (payerAddressData && mainOfficeAddressData && addressesMatch(payerAddressData, mainOfficeAddressData)) {
        console.log("[UPDATE] Main Office address matches Payer address - setting sameAsPayer to true");
        setSameAsPayer(true);
      } else {
        setSameAsPayer(false);
      }

      if (mainOfficeAddressData && businessLocationAddressData && addressesMatch(mainOfficeAddressData, businessLocationAddressData)) {
        console.log("[UPDATE] Business Location address matches Main Office address - setting sameAsMain to true");
        setSameAsMain(true);
      } else {
        setSameAsMain(false);
      }

      // Contact information
      if (data.contact) {
        setContactLastname(data.contact.lastname || "");
        setContactFirstname(data.contact.firstname || "");
        setContactMiddlename(data.contact.middlename || "");
        setContactSuffix(data.contact.suffix || "");
        setContactMobileNumber(data.contact.mobile || "");
        setContactTelephoneNumber(data.contact.phone || "");
      }

      // Lease information
      if (data.lease) {
        setLesName(data.lease.name || "");
        setLesAmount(data.lease.amount || "");
      }

      // Quantities
      if (data.quantities && Array.isArray(data.quantities)) {
        data.quantities.forEach((q: any) => {
          switch (q.type) {
            case "Business Area":
              setBusinessArea(q.quantity?.toString() || "");
              setOwned(q.owned === 1 ? "yes" : q.owned === 2 ? "no" : "notspecified");
              break;
            case "No of Floor":
              setFloorArea(q.quantity?.toString() || "");
              break;
            case "No of Female Employee":
              setEmployeeFemale(q.quantity?.toString() || "");
              break;
            case "No of Male Employee":
              setEmployeeMale(q.quantity?.toString() || "");
              break;
            case "No of LGU Employee":
              setEmployeeLgu(q.quantity?.toString() || "");
              break;
            case "No of Vans and Trucks":
              setVanTruck(q.quantity?.toString() || "");
              break;
            case "No of MotorCycles":
              setMotorcycle(q.quantity?.toString() || "");
              break;
          }
        });
      }

      // Business Lines
      if (data.businessLines && Array.isArray(data.businessLines)) {
        const lines = data.businessLines.map((line: any) => ({
          id: parseInt(line.businessLineId),
          code: line.code || "",
          name: line.name || "",
          description: line.description || "",
          hasTerm: line.hasTerm || false,
          termId: parseInt(line.businessLineTermId) || 0,
          classification: line.classification || "",
          units: line.units?.toString() || "",
          capital: line.capital?.toString() || "",
          essential: line.essential?.toString() || "",
          nonEssential: line.nonEssential?.toString() || "",
          registrationNumber: line.registrationNumber || "",
          expiration: line.expiration || ""
        }));
        setBusinessLines(lines);
      }

      // Measures/Pax
      if (data.measuresPax && Array.isArray(data.measuresPax)) {
        const measuresData = data.measuresPax.map((m: any) => ({
          businessLineId: m.businessLineId?.toString() || "",
          measureId: m.measureId?.toString() || "",
          units: m.units?.toString() || "",
          capacity: m.capacity?.toString() || "",
          measureName: m.measureName || "",
          lineBusiness: m.lineBusiness || ""
        }));
        setMeasures(measuresData);
      }

      // ADD THIS HERE (after measures/pax, before the success alert)
      if (data.isRenewal || data.isExpired) {
        setExistingAttachments([]);
        console.log(" Renewal mode: Attachments cleared, user must upload new ones");
      } else if (data.attachments && Array.isArray(data.attachments)) {
        setExistingAttachments(data.attachments);
        console.log("Loaded existing attachments:", data.attachments);
      }

      //  FIX: Reset loading flag BEFORE showing success message
      setIsLoadingData(false);
      setIsLoadingApplication(false);

      Alert.alert("Success", data.isRenewal ? "Renewal application data loaded" : "Application data loaded successfully");
    } catch (error: any) {
      console.error("Error fetching application:", error);

      let errorMessage = "Failed to load application data";
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = "Session expired. Please log in again.";
        } else if (status === 403) {
          errorMessage = "You don't have permission to edit this application.";
        } else if (status === 404) {
          errorMessage = "Application not found.";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }

      Alert.alert("Error", errorMessage, [
        {
          text: "OK",
          onPress: () => router.back()
        }
      ]);

    } finally {
      // Ensure flags are reset even on error
      setTimeout(() => {
        setIsLoadingApplication(false);
        setIsLoadingData(false);
      }, 100);
    }
  };

  const isFieldEditable = (fieldType: 'personal' | 'business' | 'other'): boolean => {
    const status = Number(applicationStatus);
    const isReleasedStatus = status === 6;

    // If renewal mode, allow editing regardless of status
    if (isRenewalMode) {
      console.log("🔓 Renewal mode: All fields editable");
      return true;
    }

    // If NOT in update mode, allow editing (new application)
    if (!isUpdateMode) {
      return true;
    }

    // If in update mode but NOT released (status !== 6), allow editing
    if (isUpdateMode && !isReleasedStatus) {
      return true;
    }

    // If status is 6, only allow editing for personal and business name fields
    if (isUpdateMode && isReleasedStatus) {
      console.log(`🔒 Status 6: Field type '${fieldType}' editable:`, fieldType === 'personal' || fieldType === 'business');
      return fieldType === 'personal' || fieldType === 'business';
    }

    return true;
  };



  const handleViewAttachment = async (attachmentId: number, filename: string) => {
    try {
      const API_URL = await getApiUrl();
      setIsLoadingData(true);
      const response = await axios.get(
        `${API_URL}/applications/${applicationId}/attachments/${attachmentId}/base64`,
        {
          withCredentials: true,
          timeout: 30000
        }
      );

      if (response.data) {
        setViewingAttachment(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching attachment:", error);
      Alert.alert("Error", "Failed to load attachment: " + (error.response?.data?.error || error.message));
    } finally {
      setIsLoadingData(false);
    }
  };


  const handleDeleteAttachment = (attachmentId: number, filename: string) => {
    Alert.alert(
      "Delete Attachment",
      `Are you sure you want to delete "${filename}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setExistingAttachments(prev =>
              prev.filter(att => att.attachmentId !== attachmentId)
            );

            // Track deleted attachment ID
            setDeletedAttachmentIds(prev => [...prev, attachmentId]);

            Alert.alert("Success", "Attachment will be deleted when you save the application.");
          }
        }
      ]
    );
  };


  const loadAddressFromBarangayId = async (barangayId: number, type: 'taxpayer' | 'business' | 'location', signal?: AbortSignal) => {
    try {
      if (signal?.aborted) return;
      console.log(`[DEBUG] Loading address for barangay ${barangayId}, type: ${type}`);
      const API_URL = await getApiUrl();
      // Fetch barangay details
      const brgyResponse = await axios.get(`${API_URL}/barangay/${barangayId}`, { signal });
      if (signal?.aborted) return;
      console.log('[DEBUG] Barangay response:', brgyResponse.data);
      const barangayData = brgyResponse.data;

      if (!barangayData) {
        console.error('[ERROR] No barangay data returned');
        return;
      }

      // Fetch municipality
      console.log(`[DEBUG] Fetching municipality ${barangayData.municipalityId}`);
      const muniResponse = await axios.get(`${API_URL}/municipality/${barangayData.municipalityId}`, { signal });
      if (signal?.aborted) return;
      console.log('[DEBUG] Municipality response:', muniResponse.data);
      const municipalityData = muniResponse.data;

      if (!municipalityData) {
        console.error('[ERROR] No municipality data returned');
        return;
      }

      // Fetch province
      console.log(`[DEBUG] Fetching province ${municipalityData.provinceId}`);
      const provResponse = await axios.get(`${API_URL}/province/${municipalityData.provinceId}`, { signal });
      if (signal?.aborted) return;
      console.log('[DEBUG] Province response:', provResponse.data);
      const provinceData = provResponse.data;

      if (!provinceData) {
        console.error('[ERROR] No province data returned');
        return;
      }

      // Fetch region
      console.log(`[DEBUG] Fetching region ${provinceData.regionId}`);
      const regionResponse = await axios.get(`${API_URL}/region/${provinceData.regionId}`, { signal });
      if (signal?.aborted) return;
      console.log('[DEBUG] Region response:', regionResponse.data);
      const regionData = regionResponse.data;

      if (!regionData) {
        console.error('[ERROR] No region data returned');
        return;
      }

      console.log('[DEBUG] All address data fetched successfully, populating form...');

      if (!signal?.aborted && isMountedRef.current) {
        if (type === 'taxpayer') {
          setRegion(regionData.name);
          setRegionId(regionData.id);
          await fetchProvinces(regionData.id, 'taxpayer', signal);

          setProvince(provinceData.name);
          setProvinceId(provinceData.id);
          await fetchMunicipalities(provinceData.id, 'taxpayer', signal);

          setMunicipality(municipalityData.name);
          setMunicipalityId(municipalityData.id);
          await fetchBarangays(municipalityData.id, 'taxpayer', signal);

          setBarangay(barangayData.name);
          setBarangayId(barangayData.id);
          setZipcode(barangayData.zipcode);

          console.log('[SUCCESS] Taxpayer address loaded successfully');
        } else if (type === 'business') {
          setBisRegion(regionData.name);
          setBisRegionId(regionData.id);
          await fetchProvinces(regionData.id, 'business', signal);

          setBisProvince(provinceData.name);
          setBisProvinceId(provinceData.id);
          await fetchMunicipalities(provinceData.id, 'business', signal);

          setBisMunicipality(municipalityData.name);
          setBisMunicipalityId(municipalityData.id);
          await fetchBarangays(municipalityData.id, 'business', signal);

          setBisBarangay(barangayData.name);
          setBisBarangayId(barangayData.id);
          setBisZipcode(barangayData.zipcode);

          console.log('[SUCCESS] Business address loaded successfully');
        } else {
          setLocRegion(regionData.name);
          setLocRegionId(regionData.id);
          await fetchProvinces(regionData.id, 'location', signal);

          setLocProvince(provinceData.name);
          setLocProvinceId(provinceData.id);
          await fetchMunicipalities(provinceData.id, 'location', signal);

          setLocMunicipality(municipalityData.name);
          setLocMunicipalityId(municipalityData.id);
          await fetchBarangays(municipalityData.id, 'location', signal);

          setLocBarangay(barangayData.name);
          setLocBarangayId(barangayData.id);
          setLocZipcode(barangayData.zipcode);

          console.log('[SUCCESS] Location address loaded successfully');
        }
      }
    } catch (error: any) {
      console.error("Error loading address hierarchy:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });

      Alert.alert(
        "Address Load Error",
        `Failed to load address information: ${error.response?.data?.error || error.message}`,
        [{ text: "OK" }]
      );

    }
  };

  // Helper mapping functions
  const mapBusinessTypeFromAPI = (type: number): BusinessType => {
    const map: Record<number, BusinessType> = {
      0: "sole proprietorship",
      1: "partnership",
      2: "corporation",
      3: "cooperative",
      4: "one person corporation",
      5: "association"
    };
    return map[type] || "sole proprietorship";
  };

  const mapBusinessActivityFromAPI = (activity: number): businessActivity => {
    const map: Record<number, businessActivity> = {
      0: "Main Office",
      1: "BranchOffice",
      2: "AdminOfficeOnly",
      3: "Warehouse",
      4: "Others"
    };
    return map[activity] || "Main Office";
  };


  // Add useEffect to check if we're in update mode
  useEffect(() => {
    if (mode !== "update" || !applicationId) {
      return;
    }

    console.log("[FILLUP] Update mode detected:", {
      applicationId,
      timestamp,
      currentTime: Date.now()
    });

    // Create abort controller
    const abortController = new AbortController();
    let isCancelled = false;

    // Reset flags immediately
    setIsUpdateMode(true);
    setIsLoadingData(false);
    setIsLoadingApplication(false);

    // Small delay to prevent rapid re-fetching
    const timeoutId = setTimeout(() => {
      if (!isCancelled && isMountedRef.current) {
        console.log("[FILLUP] Calling fetchApplicationForEdit for app:", applicationId);
        // PASS THE SIGNAL HERE
        fetchApplicationForEdit(applicationId, abortController.signal);
      }
    }, 300);

    // Cleanup function
    return () => {
      console.log("[FILLUP] Cleanup - aborting fetch");
      isCancelled = true;
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [mode, applicationId, timestamp]);

  const fetchMunicipalityMeasures = async () => {
    try {
      const API_URL = await getApiUrl();
      const response = await axios.get(`${API_URL}/municipality/measures`);
      if (response.data.measures) {
        setMunicipalityMeasures(response.data.measures);
        console.log("Fetched municipality measures:", response.data.measures.length);
      }
    } catch (error) {
      console.error("Error fetching municipality measures:", error);

    }
  };

  const fetchProvinces = async (regId: number, type: 'taxpayer' | 'business' | 'location', signal?: AbortSignal) => {
    try {
      const API_URL = await getApiUrl();
      const response = await axios.get(`${API_URL}/provinces/${regId}`, {
        timeout: 10000,
        signal 
      });

      if (!isMountedRef.current) return;

      if (type === 'taxpayer') {
        setTaxpayerProvinces(response.data);
        if (!isLoadingData) {
          setProvince("");
          setProvinceId(null);
          setTaxpayerMunicipalities([]);
          setMunicipality("");
          setMunicipalityId(null);
          setTaxpayerBarangays([]);
          setBarangay("");
          setZipcode("");
        }
      } else if (type === "business") {
        setBusinessProvinces(response.data);
        if (!isLoadingData) {
          setBisProvince("");
          setBisProvinceId(null);
          setBusinessMunicipalities([]);
          setBisMunicipality("");
          setBisMunicipalityId(null);
          setBusinessBarangays([]);
          setBisBarangay("");
          setBisZipcode("");
        }
      } else {
        setLocationProvinces(response.data);
        if (!isLoadingData) {
          setLocProvince("");
          setLocProvinceId(null);
          setLocationMunicipalities([]);
          setLocMunicipality("");
          setLocMunicipalityId(null);
          setLocationBarangays([]);
          setLocBarangay("");
          setLocZipcode("");
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type} provinces:`, error);
      Alert.alert("Error", `Failed to load provinces for ${type} address`);
    }
  };

  const fetchMunicipalities = async (provId: number, type: 'taxpayer' | 'business' | 'location', signal?: AbortSignal) => {
    try {
      const API_URL = await getApiUrl();
      const response = await axios.get(`${API_URL}/municipalities/${provId}`, {
        timeout: 10000,
        signal //  Add signal
      });

      if (!isMountedRef.current) return;

      if (type === 'taxpayer') {
        setTaxpayerMunicipalities(response.data);
        if (!isLoadingData) {
          setMunicipality("");
          setMunicipalityId(null);
          setTaxpayerBarangays([]);
          setBarangay("");
          setZipcode("");
        }
      } else if (type === 'business') {
        setBusinessMunicipalities(response.data);
        if (!isLoadingData) {
          setBisMunicipality("");
          setBisMunicipalityId(null);
          setBusinessBarangays([]);
          setBisBarangay("");
          setBisZipcode("");
        }
      } else {
        setLocationMunicipalities(response.data);
        if (!isLoadingData) {
          setLocMunicipality("");
          setLocMunicipalityId(null);
          setLocationBarangays([]);
          setLocBarangay("");
          setLocZipcode("");
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type} municipalities:`, error);
      Alert.alert("Error", `Failed to load municipalities for ${type} address`);
    }
  };

  const addressesMatch = (
    addr1: { barangayId: number | null; unitNumber: string; buildingName: string; lotNumber: string; blockNumber: string; street: string; subdivision: string },
    addr2: { barangayId: number | null; unitNumber: string; buildingName: string; lotNumber: string; blockNumber: string; street: string; subdivision: string }
  ): boolean => {
    return (
      addr1.barangayId === addr2.barangayId &&
      addr1.unitNumber === addr2.unitNumber &&
      addr1.buildingName === addr2.buildingName &&
      addr1.lotNumber === addr2.lotNumber &&
      addr1.blockNumber === addr2.blockNumber &&
      addr1.street === addr2.street &&
      addr1.subdivision === addr2.subdivision
    );
  };

  const fetchBarangays = async (muniId: number, type: 'taxpayer' | 'business' | 'location', signal?: AbortSignal) => {
    try {
      const API_URL = await getApiUrl();
      const response = await axios.get(`${API_URL}/barangays/${muniId}`, {
        timeout: 10000,
        signal
      });

      if (!isMountedRef.current) return;
      const barangays = response.data.barangays;

      if (type === 'taxpayer') {
        setTaxpayerBarangays(barangays);
        if (!isLoadingData) {
          setBarangay("");
          setZipcode("");
        }
      } else if (type === 'business') {
        setBusinessBarangays(barangays);
        if (!isLoadingData) {
          setBisBarangay("");
          setBisZipcode("");
        }
      } else {
        setLocationBarangays(barangays);
        if (!isLoadingData) {
          setLocBarangay("");
          setLocZipcode("");
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type} barangays:`, error);
      Alert.alert("Error", `Failed to load barangays for ${type} address`);
    }
  };

  const pickDocumentForAttachment = async (attachmentId: number) => {
    try {
      console.log("📂 Opening document picker...");

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("🚫 File picking cancelled.");
        return;
      }

      const file = result.assets ? result.assets[0] : result;

      console.log("📄 File selected:");
      console.log(`- Name: ${file.name}`);
      console.log(`- Type: ${file.mimeType}`);
      console.log(`- Size: ${file.size} bytes`);
      console.log(`- URI (cached path): ${file.uri}`);

      // Log current cache directory
      console.log(`📁 Expo cache directory: ${FileSystem.cacheDirectory}`);
      console.log(`📁 Expo document directory: ${FileSystem.documentDirectory}`);

      // Read as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: "base64",
      });

      // Optionally, copy file to a permanent directory
      const newPath = `${FileSystem.documentDirectory}${file.name}`;
      await FileSystem.copyAsync({
        from: file.uri,
        to: newPath,
      });

      console.log(`✅ File copied to: ${newPath}`);

      // Save data in state
      setUploadedFiles((prev) => ({
        ...prev,
        [attachmentId]: {
          filename: file.name,
          fileData: base64,
          fileType: file.mimeType || "application/octet-stream",
          savedPath: newPath,
        },
      }));

      console.log(`✅ File ${file.name} encoded and stored successfully`);
    } catch (error: any) {
      console.error("❌ Error reading or saving file:", error);
      Alert.alert("File Error", `Unable to process selected file: ${error.message}`);
    }
  };


  const handleTaxpayerRegionChange = (value: string) => {
    setRegion(value);
    const selected = regions.find(r => r.name === value);
    if (selected) {
      setRegionId(selected.id);
    }
  };

  const handleTaxpayerProvinceChange = (value: string) => {
    setProvince(value);
    const selected = taxpayerProvinces.find(p => p.name === value);
    if (selected) {
      setProvinceId(selected.id);
    }
  };

  const handleTaxpayerMunicipalityChange = (value: string) => {
    setMunicipality(value);
    const selected = taxpayerMunicipalities.find(m => m.name === value);
    if (selected) {
      setMunicipalityId(selected.id);
    }
  };

  const handleTaxpayerBarangayChange = (value: string) => {
    setBarangay(value);
    const selected = taxpayerBarangays.find(b => b.name === value);
    if (selected) {
      setBarangayId(selected.id);
      setZipcode(selected.zipcode);
    }
  };

  const handleBusinessRegionChange = (value: string) => {
    setBisRegion(value);
    const selected = regions.find(r => r.name === value);
    if (selected) {
      setBisRegionId(selected.id);
    }
  };

  const handleBusinessProvinceChange = (value: string) => {
    setBisProvince(value);
    const selected = businessProvinces.find(p => p.name === value);
    if (selected) {
      setBisProvinceId(selected.id);
    }
  };

  const handleBusinessMunicipalityChange = (value: string) => {
    setBisMunicipality(value);
    const selected = businessMunicipalities.find(m => m.name === value);
    if (selected) {
      setBisMunicipalityId(selected.id);
    }
  };

  const handleBusinessBarangayChange = (value: string) => {
    setBisBarangay(value);
    const selected = businessBarangays.find(b => b.name === value);
    if (selected) {
      setBisBarangayId(selected.id);
      setBisZipcode(selected.zipcode);
    }
  };

  const handleLocationRegionChange = (value: string) => {
    setLocRegion(value);
    const selected = regions.find(r => r.name === value);
    if (selected) {
      setLocBarangayId(selected.id);
      setLocRegionId(selected.id);
    }
  };

  const handleLocationProvinceChange = (value: string) => {
    setLocProvince(value);
    const selected = locationProvinces.find(p => p.name === value);
    if (selected) {
      setLocProvinceId(selected.id);
    }
  };

  const handleLocationMunicipalityChange = (value: string) => {
    setLocMunicipality(value);
    const selected = locationMunicipalities.find(m => m.name === value);
    if (selected) {
      setLocMunicipalityId(selected.id);
    }
  };

  const handleLocationBarangayChange = (value: string) => {
    setLocBarangay(value);
    const selected = locationBarangays.find(b => b.name === value);
    if (selected) {
      setLocBarangayId(selected.id);
      setLocZipcode(selected.zipcode);
    }
  };

  const handleSameAsPayer = async (checked: boolean) => {
    setSameAsPayer(checked);
    if (checked) {
      if (!region || !province || !municipality || !barangay) {
        Alert.alert("Incomplete Address", "Please complete the Taxpayer Address first before using 'Same as Taxpayer Address'");
        setSameAsPayer(false);
        return;
      }

      setBisRegion(region);
      setBisRegionId(regionId);
      setBisProvince(province);
      setBisProvinceId(provinceId);
      setBisMunicipality(municipality);
      setBisMunicipalityId(municipalityId);
      setBisBarangay(barangay);
      setBisBarangayId(barangayId);
      setBisZipcode(zipcode);
      setBisHouseNo(houseNo);
      setBisBuildingName(buildingName);
      setBisLotNo(lotNo);
      setBisBlockNo(blockNo);
      setBisStreet(street);
      setBisSubdivision(subdivision);

      setBusinessProvinces(taxpayerProvinces);
      setBusinessMunicipalities(taxpayerMunicipalities);
      setBusinessBarangays(taxpayerBarangays);
    } else {
      setBisRegion("");
      setBisRegionId(null);
      setBisProvince("");
      setBisProvinceId(null);
      setBisMunicipality("");
      setBisMunicipalityId(null);
      setBisBarangay("");
      setBisZipcode("");
      setBisHouseNo("");
      setBisBuildingName("");
      setBisLotNo("");
      setBisBlockNo("");
      setBisStreet("");
      setBisSubdivision("");
      setBusinessProvinces([]);
      setBusinessMunicipalities([]);
      setBusinessBarangays([]);
    }
  };

  const handleSameAsMain = async (checked: boolean) => {
    setSameAsMain(checked);
    if (checked) {
      if (!bisRegion || !bisProvince || !bisMunicipality || !bisBarangay) {
        Alert.alert("Incomplete Address", "Please complete the Main Office Address first before using 'Same as Main Office Address'");
        setSameAsMain(false);
        return;
      }

      setLocRegion(bisRegion);
      setLocRegionId(bisRegionId);
      setLocProvince(bisProvince);
      setLocProvinceId(bisProvinceId);
      setLocMunicipality(bisMunicipality);
      setLocMunicipalityId(bisMunicipalityId);
      setLocBarangay(bisBarangay);
      setLocBarangayId(bisBarangayId);
      setLocZipcode(bisZipcode);
      setLocHouseNo(bisHouseNo);
      setLocBuildingName(bisBuildingName);
      setLocLotNo(bislotNo);
      setLocBlockNo(bisBlockNo);
      setLocStreet(bisStreet);
      setLocSubdivision(bisSubdivision);

      setLocationProvinces(businessProvinces);
      setLocationMunicipalities(businessMunicipalities);
      setLocationBarangays(businessBarangays);
    } else {
      setLocRegion("");
      setLocRegionId(null);
      setLocProvince("");
      setLocProvinceId(null);
      setLocMunicipality("");
      setLocMunicipalityId(null);
      setLocBarangay("");
      setLocZipcode("");
      setLocHouseNo("");
      setLocBuildingName("");
      setLocLotNo("");
      setLocBlockNo("");
      setLocStreet("");
      setLocSubdivision("");
      setLocationProvinces([]);
      setLocationMunicipalities([]);
      setLocationBarangays([]);
    }
  };

  const searchBusinessLines = async (query: string) => {
    if (query.trim().length < 2) {
      setBusinessLineResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError("");
      const API_URL = await getApiUrl();
      const response = await axios.get(`${API_URL}/businesslines/search`, {
        params: {
          q: query.trim(),
          limit: 50
        },
        timeout: 10000
      });

      if (response.data && response.data.results) {
        setBusinessLineResults(response.data.results);
      } else {
        setBusinessLineResults([]);
      }
    } catch (error: any) {
      console.error("Error searching business lines:", error);
      setSearchError("Failed to search business lines. Please try again.");
      setBusinessLineResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    searchBusinessLines(text);
  };

  const addBusinessLine = (item: BusinessLineResult) => {
    const lineToAdd: BusinessLine = {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      hasTerm: item.hasTerm,
      termId: item.termId,
      classification: item.classification || "",
      units: "",
      capital: "",
      essential: "",
      nonEssential: "",
      registrationNumber: "",
      expiration: ""
    };

    setBusinessLines([...businessLines, lineToAdd]);
    setBusinessModalVisible(false);
    setSearchQuery("");
    setBusinessLineResults([]);
  };

  const updateBusinessLine = (index: number, field: keyof BusinessLine, value: string) => {
    const updated = [...businessLines];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessLines(updated);
  };

  const removeBusinessLine = (index: number) => {
    setBusinessLines(businessLines.filter((_, i) => i !== index));
  };


  const handleSubmit = async () => {
    // Basic information validation
    if (!lastname.trim() || !firstname.trim() || !mobile.trim() || !email.trim() ||
      !businessName.trim() || !traderName.trim() || !registrationNo.trim() || !tin.trim()) {
      Alert.alert("Missing Information", "Please fill out all required fields before submitting.");
      return;
    }

    // NEW: Tax Declaration validation - must be numeric and not empty
    if (!taxDeclaration.trim()) {
      Alert.alert(
        "Tax Declaration Required",
        "Please enter the Tax Declaration number.",
        [
          {
            text: "OK",
            onPress: () => {
              // Scroll to and focus the Tax Declaration input
              setTimeout(() => {
                taxDeclarationRef.current?.focus();
              }, 100);
            }
          }
        ]
      );
      return;
    }

    const taxDecNum = parseFloat(taxDeclaration);
    if (isNaN(taxDecNum) || taxDecNum <= 0) {
      Alert.alert(
        "Invalid Tax Declaration",
        "Tax Declaration must be a valid number greater than 0.",
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => {
                taxDeclarationRef.current?.focus();
              }, 100);
            }
          }
        ]
      );
      return;
    }

    // ✅ NEW: Property Index validation - must be numeric and not empty
    if (!propertyIndex.trim()) {
      Alert.alert(
        "Property Index Required",
        "Please enter the Property Index number.",
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => {
                propertyIndexRef.current?.focus();
              }, 100);
            }
          }
        ]
      );
      return;
    }

    const propIndexNum = parseFloat(propertyIndex);
    if (isNaN(propIndexNum) || propIndexNum <= 0) {
      Alert.alert(
        "Invalid Property Index",
        "Property Index must be a valid number greater than 0.",
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => {
                propertyIndexRef.current?.focus();
              }, 100);
            }
          }
        ]
      );
      return;
    }

    // ✅ NEW: Business Area validation - must be greater than 0
    const businessAreaNum = parseFloat(businessArea);
    if (isNaN(businessAreaNum) || businessAreaNum <= 0) {
      Alert.alert(
        "Business Area Required",
        "Business Area (in sq m) must be a number greater than 0.",
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => {
                businessAreaRef.current?.focus();
              }, 100);
            }
          }
        ]
      );
      return;
    }

    // Business Line validation
    if (businessLines.length === 0) {
      Alert.alert("Business Line Required", "Please add at least one line of business before submitting.");
      return;
    }

    // Validate each business line has required fields filled
    for (let i = 0; i < businessLines.length; i++) {
      const line = businessLines[i];
      const lineNumber = i + 1;

      const units = parseFloat(line.units || "0");
      const capital = parseFloat(line.capital || "0");
      const essential = parseFloat(line.essential || "0");
      const nonEssential = parseFloat(line.nonEssential || "0");

      // If all four are 0 or empty, it's invalid
      if (units <= 0 && capital <= 0 && essential <= 0 && nonEssential <= 0) {
        Alert.alert(
          "Incomplete Business Line",
          `Business Line #${lineNumber} (${line.code}): Please provide a value greater than 0 in at least one of these fields: Units, Capital, Essential, or Non-Essential.`
        );
        return;
      }
    }

    // Documentary Requirements validation
    const requiredAttachments = municipalityAttachments.filter(att => att.required === 1);

    for (const attachment of requiredAttachments) {
      const hasNewUpload = uploadedFiles[attachment.id];
      const hasExisting = existingAttachments.some(
        existing => existing.attachmentId === attachment.id &&
          !deletedAttachmentIds.includes(attachment.id)
      );

      if (!hasNewUpload && !hasExisting) {
        Alert.alert(
          "Missing Required Document",
          `Please upload "${attachment.title}" before submitting. This document is required.`
        );
        return;
      }
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    const applicationTypeMap: Record<ApplicationType, string> = { new: "1", renew: "2" };
    const paymentModeMap: Record<PaymentMode, string> = { annual: "0", "bi-annual": "1", quarterly: "2" };
    const genderMap: Record<Gender, string> = { male: "0", female: "1" };
    const ownedMap: Record<Owned, string> = { yes: "1", no: "2", notspecified: "0" };
    const businessTypeMap: Record<BusinessType, string> = {
      "sole proprietorship": "0", partnership: "1", corporation: "2",
      cooperative: "3", "one person corporation": "4", association: "5"
    };
    const businessActivityMap: Record<businessActivity, string> = {
      "Main Office": "0", BranchOffice: "1", AdminOfficeOnly: "2",
      Warehouse: "3", Others: "4"
    };

    try {
      setIsSubmitting(true);

      const attachments = Object.entries(uploadedFiles).map(([attachmentId, fileInfo]) => ({
        attachmentId: attachmentId.toString(),
        filename: fileInfo.filename,
        fileData: fileInfo.fileData,
        fileType: fileInfo.fileType
      }));

      const payload = {
        applicationType: applicationTypeMap[applicationType],
        paymentMode: paymentModeMap[paymentMode],
        businessName,
        traderName,
        businessType: businessTypeMap[businessType],
        businessActivity: businessActivityMap[businessActivity],
        permitNumber: registrationNo,
        taxNumber: tin,
        taxDeclaration: taxDeclaration || "",
        propertyIndex: propertyIndex || "",
        incentives: "0",
        payer: {
          lastname,
          firstname,
          middlename: middlename || "",
          suffix: suffix || "",
          mobile,
          telephone: telephone || "",
          email,
          gender: genderMap[gender]
        },
        attachments: attachments,
        deletedAttachments: deletedAttachmentIds,
        payerAddress: {
          barangay: barangayId?.toString() || "",
          unitNumber: houseNo || "",
          buildingName: buildingName || "",
          lotNumber: lotNo || "",
          blockNumber: blockNo || "",
          street: street || "",
          subdivision: subdivision || ""
        },
        mainOfficeAddress: {
          barangay: bisBarangayId?.toString() || "",
          unitNumber: bisHouseNo || "",
          buildingName: bisBuildingName || "",
          lotNumber: bislotNo || "",
          blockNumber: bisBlockNo || "",
          street: bisStreet || "",
          subdivision: bisSubdivision || ""
        },
        businessLocationAddress: {
          barangay: locBarangayId?.toString() || "",
          unitNumber: locHouseNo || "",
          buildingName: locBuildingName || "",
          lotNumber: loclotNo || "",
          blockNumber: locBlockNo || "",
          street: locStreet || "",
          subdivision: locSubdivision || ""
        },
        contact: {
          lastname: contactLastname || "",
          firstname: contactFirstname || "",
          middlename: contactMiddlename || "",
          suffix: contactSuffix || "",
          mobile: contactMobileNumber || "",
          phone: contactTelephoneNumber || ""
        },
        lease: {
          name: lesName || "",
          amount: lesAmount || ""
        },
        quantities: [
          { type: "Business Area", quantity: businessArea || "0", owned: ownedMap[owned] },
          { type: "No of Floor", quantity: floorArea || "0", owned: ownedMap[owned] },
          { type: "No of Female Employee", quantity: employeeFemale || "0", owned: "0" },
          { type: "No of Male Employee", quantity: employeeMale || "0", owned: "0" },
          { type: "No of LGU Employee", quantity: employeeLgu || "0", owned: "0" },
          { type: "No of Vans and Trucks", quantity: vanTruck || "0", owned: ownedMap[owned] },
          { type: "No of MotorCycles", quantity: motorycle || "0", owned: ownedMap[owned] }
        ].filter(q => parseFloat(q.quantity) > 0),
        businessLines: businessLines.map(line => ({
          businessLineId: line.id.toString(),
          businessLineTermId: line.termId.toString(),
          units: line.units || "0",
          capital: line.capital || "0",
          essential: line.essential || "0",
          nonEssential: line.nonEssential || "0",
          registrationNumber: line.registrationNumber || "",
          expiration: line.expiration || ""
        })),
        measuresPax: measures.map(m => ({
          businessLineId: m.businessLineId,
          measureId: m.measureId,
          units: m.units || "0",
          capacity: m.capacity || "0"
        }))
      };

      let response;

      // Choose endpoint based on mode
      if (isUpdateMode && applicationId) {
        const API_URL = await getApiUrl();
        // UPDATE existing application
        response = await axios.put(
          `${API_URL}/applications/${applicationId}`,
          payload,
          {
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            withCredentials: true,
            timeout: 30000
          }
        );

        if (response.data?.status === "OK") {
          clearAllFormData();
          Alert.alert(
            "Success",
            isRenewalMode
              ? `Renewal created successfully!\nNew Reference: ${response.data.reference || 'N/A'}`
              : `Application updated successfully!`,
            [
              {
                text: "OK",
                onPress: () => router.replace("/(tabs)/home")
              }
            ]
          );
        } else {
          Alert.alert("Error", "Application update failed");
        }
      } else {
        const API_URL = await getApiUrl();
        // CREATE new application
        response = await axios.post(`${API_URL}/applyNew`, payload, {
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          withCredentials: true,
          timeout: 30000
        });

        if (response.data?.applicationId) {
          clearAllFormData();
          Alert.alert(
            "Success",
            `Application submitted successfully!\nReference: ${response.data.reference || 'N/A'}`,
            [
              {
                text: "OK",
                onPress: () => router.replace("/(tabs)/home")
              }
            ]
          );
        } else {
          Alert.alert("Error", "Application submission failed - no application ID received");
        }
      }
    } catch (error: any) {
      console.error("Submit error:", error);

      let errorMessage = "Unknown error occurred";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please check your data and try again.";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. You don't have permission to update this application.";
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const taxpayerFields = [
    { placeholder: "Lastname *", value: lastname, setter: setLastname },
    { placeholder: "Firstname *", value: firstname, setter: setFirstname },
    { placeholder: "Middlename", value: middlename, setter: setMiddlename },
    { placeholder: "Suffix", value: suffix, setter: setSuffix },
    { placeholder: "Mobile Number *", value: mobile, setter: setMobile, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "Telephone Number", value: telephone, setter: setTelephone, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "Email Address *", value: email, setter: setEmail, keyboard: "email-address" as KeyboardTypeOptions }
  ];

  const payerAddress = [
    { placeholder: "House /Bldg. No", value: houseNo, setter: setHouseNo },
    { placeholder: "Building Name", value: buildingName, setter: setBuildingName },
    { placeholder: "Lot No", value: lotNo, setter: setLotNo },
    { placeholder: "Block No", value: blockNo, setter: setBlockNo },
    { placeholder: "Street", value: street, setter: setStreet },
    { placeholder: "Subdivision", value: subdivision, setter: setSubdivision }
  ];

  const mainOfficeAddress = [
    { placeholder: "House /Bldg. No", value: bisHouseNo, setter: setBisHouseNo },
    { placeholder: "Building Name", value: bisBuildingName, setter: setBisBuildingName },
    { placeholder: "Lot No", value: bislotNo, setter: setBisLotNo },
    { placeholder: "Block No", value: bisBlockNo, setter: setBisBlockNo },
    { placeholder: "Street", value: bisStreet, setter: setBisStreet },
    { placeholder: "Subdivision", value: bisSubdivision, setter: setBisSubdivision }
  ];

  const businessLocationAddress = [
    { placeholder: "House /Bldg. No", value: locHouseNo, setter: setLocHouseNo },
    { placeholder: "Building Name", value: locBuildingName, setter: setLocBuildingName },
    { placeholder: "Lot No", value: loclotNo, setter: setLocLotNo },
    { placeholder: "Block No", value: locBlockNo, setter: setLocBlockNo },
    { placeholder: "Street", value: locStreet, setter: setLocStreet },
    { placeholder: "Subdivision", value: locSubdivision, setter: setLocSubdivision }
  ];

  const contactInformation = [
    { placeholder: " Contact Lastname ", value: contactLastname, setter: setContactLastname },
    { placeholder: "Contact Firstname ", value: contactFirstname, setter: setContactFirstname },
    { placeholder: "Contact Middlename", value: contactMiddlename, setter: setContactMiddlename },
    { placeholder: "Contact Suffix", value: contactSuffix, setter: setContactSuffix },
    { placeholder: "Contact Mobile Number ", value: contactMobileNumber, setter: setContactMobileNumber, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "Contact Telephone Number", value: contactTelephoneNumber, setter: setContactTelephoneNumber, keyboard: "phone-pad" as KeyboardTypeOptions },
  ];

  const leaseInformation = [
    { placeholder: "Name ", value: lesName, setter: setLesName },
    { placeholder: "Amount", value: lesAmount, setter: setLesAmount, keyboard: "phone-pad" as KeyboardTypeOptions },
  ];

  const quatityInformation = [
    { placeholder: "Business Area (in sq m)*", value: businessArea, setter: setBusinessArea, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "Total Floor Area", value: floorArea, setter: setFloorArea, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "No. of Female in Establishement", value: employeeFemale, setter: setEmployeeFemale, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "No. of Male in Establishement", value: employeeMale, setter: setEmployeeMale, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "No. of Employees Resideing in LGU", value: employeeLgu, setter: setEmployeeLgu, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "No. of Delivery van/truck", value: vanTruck, setter: setVanTruck, keyboard: "phone-pad" as KeyboardTypeOptions },
    { placeholder: "No. of Delivery Motorcycle", value: motorycle, setter: setMotorcycle, keyboard: "phone-pad" as KeyboardTypeOptions },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-4 text-gray-600">Loading address data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with loading indicator */}
      <View className="flex-row items-center bg-red-600 p-4">
        <Pressable
          onPress={() => {
            Alert.alert(
              "Leave Form?",
              "Are you sure you want to go back? All unsaved changes will be lost.",
              [
                {
                  text: "Stay",
                  style: "cancel"
                },
                {
                  text: "Leave",
                  style: "destructive",
                  onPress: () => {
                    clearAllFormData();
                    router.replace("/(tabs)/home");
                  }
                }
              ]
            );
          }}
          className="mt-6 pr-3"
        >
          <ArrowLeft size={24} color="white" />
        </Pressable>
        <View className="flex-1 items-center mt-6">
          <Text className="text-white text-lg font-bold">
            {isUpdateMode ? "Update Application" : "Business Information and Registration"}
          </Text>
          {isLoadingApplication && (
            <Text className="text-white text-xs mt-1">Loading application data...</Text>
          )}
        </View>
      </View>

      {/* Show loading indicator while fetching */}
      {isLoadingApplication ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="mt-4 text-gray-600">Loading application data...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {/* Taxpayer Information Section */}
          <Text className="text-lg font-bold text-gray-800 mb-3">Taxpayer Information</Text>

          {isRenewalMode && (
            <View className="mb-4">
              <View className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-2">🔄</Text>
                  <Text className="text-orange-900 font-bold text-lg">Renewal Application</Text>
                </View>
                <Text className="text-orange-800 text-sm mb-3">This permit has expired. Creating a renewal will generate a new reference number.</Text>
                {businessIdNo && (
                  <View className="bg-white rounded-lg p-3 border border-orange-300">
                    <Text className="text-gray-600 font-semibold text-xs mb-1">Business Id No.</Text>
                    <Text className="text-gray-900 font-mono text-lg font-bold">{businessIdNo}</Text>
                  </View>
                )}
                {linkBusinessNo && (
                  <View className="bg-white rounded-lg p-3 border border-orange-300 mt-2">
                    <Text className="text-gray-600 font-semibold text-xs mb-1">Linked Business ID</Text>
                    <Text className="text-gray-900 font-mono text-sm">{linkBusinessNo}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <Text className="text-base font-semibold text-gray-700 mb-2">Application Type:</Text>
          <View className="flex-row mb-4">
            {(["new", "renew"] as ApplicationType[]).map((type) => (
              <Pressable key={type} className="flex-row items-center mr-6" onPress={() => { if (!isReleased()) { setApplicationType(type); } }} disabled={isReleased()}>
                <View className={`w-5 h-5 mr-2 border-2 rounded items-center justify-center ${applicationType === type ? isReleased() ? "bg-gray-400 border-gray-400"
                  : "bg-red-500 border-red-500"
                  : isReleased()
                    ? "border-gray-300"
                    : "border-gray-400"
                  }`}
                >
                  {applicationType === type && <Check size={14} color="white" strokeWidth={3} />}
                </View>
                <Text className={isReleased() ? "text-gray-500" : ""}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {isReleased() && (
            <View className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <Text className="text-blue-800 text-sm font-semibold">* Certain application details cannot be modified once the application has been released. *</Text>
            </View>
          )}

          <Text className="text-base font-semibold text-gray-700 mb-2">Payment Mode:</Text>
          <View className={`border rounded mb-4 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"}`}>
            <Picker selectedValue={paymentMode} onValueChange={(val) => { if (!isReleased()) { setPaymentMode(val as PaymentMode); } }} enabled={!isReleased()} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Annual" value="annual" />
              <Picker.Item label="Bi-Annual" value="bi-annual" />
              <Picker.Item label="Quarterly" value="quarterly" />
            </Picker>
          </View>


          {taxpayerFields.map((field, idx) => (
            <TextInput
              key={idx}
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={(text) => {
                // ✅ CHANGED: Use isFieldEditable instead of isReleased
                if (isFieldEditable('personal')) {
                  const formattedText =
                    field.keyboard === "numeric" || field.keyboard === "decimal-pad"
                      ? text.replace(/[^0-9.]/g, "")
                      : text;
                  field.setter(formattedText);
                }
              }}
              keyboardType={field.keyboard ?? "default"}
              placeholderTextColor="#9ca3af"
              className={`border rounded p-3 mb-3 ${
                // CHANGED: Check if field is editable for styling
                !isFieldEditable('personal')
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-400"
                }`}
              style={{ color: "#1f2937" }}
              editable={isFieldEditable('personal')} 
            />
          ))}


          <Text className="text-base font-semibold text-gray-700 mb-2">Gender:</Text>
          <View className="flex-row mb-6">
            {(["male", "female"] as Gender[]).map((g) => (
              <Pressable key={g} className="flex-row items-center mr-6" onPress={() => setGender(g)}>
                <View className={`w-5 h-5 mr-2 border-2 rounded items-center justify-center ${gender === g ? "bg-red-500 border-red-500" : "border-gray-400"}`}>
                  {gender === g && <Check size={14} color="white" strokeWidth={3} />}
                </View>
                <Text className="capitalize">{g}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-lg font-bold text-gray-800 mb-3">Business Information</Text>

          <TextInput
            placeholder="Business Name *"
            value={businessName}
            onChangeText={(text) => {
              if (isFieldEditable('business')) setBusinessName(text); 
            }}
            placeholderTextColor="#9ca3af"
            className={`border rounded p-3 mb-3 ${!isFieldEditable('business') 
              ? "border-gray-300 bg-gray-200"
              : "border-gray-400"
              }`}
            style={{ color: "#1f2937" }}
            editable={isFieldEditable('business')} 
          />

          <TextInput
            placeholder="Trade Name *"
            value={traderName}
            onChangeText={(text) => {
              if (isFieldEditable('business')) setTraderName(text); 
            }}
            placeholderTextColor="#9ca3af"
            className={`border rounded p-3 mb-3 ${!isFieldEditable('business') 
              ? "border-gray-300 bg-gray-200"
              : "border-gray-400"
              }`}
            style={{ color: "#1f2937" }}
            editable={isFieldEditable('business')} 
          />


          <Text className="text-base font-semibold text-gray-700 mb-2">Type of Business:</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={businessType} onValueChange={(val) => setBusinessType(val as BusinessType)} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Sole Proprietorship" value="sole proprietorship" />
              <Picker.Item label="Partnership" value="partnership" />
              <Picker.Item label="Corporation" value="corporation" />
              <Picker.Item label="Cooperative" value="cooperative" />
              <Picker.Item label="One Person Corporation" value="one person corporation" />
              <Picker.Item label="Association" value="association" />
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-2">Business Activity:</Text>
          <View className={`border rounded mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"}`}>
            <Picker selectedValue={businessActivity} onValueChange={(val) => { if (!isReleased()) { setBusinessActivity(val as businessActivity); } }} enabled={!isReleased()} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937" >
              <Picker.Item label="Main Office" value="Main Office" />
              <Picker.Item label="BranchOffice" value="BranchOffice" />
              <Picker.Item label="AdminOfficeOnly" value="AdminOfficeOnly" />
              <Picker.Item label="Warehouse" value="Warehouse" />
              <Picker.Item label="Others" value="Others" />
            </Picker>
          </View>


          <TextInput
            placeholder="DTI/SEC/CDA Registration No. *"
            value={registrationNo}
            onChangeText={(text) => {
              if (!isReleased()) setRegistrationNo(text);
            }}
            placeholderTextColor="#9ca3af"
            className={`border rounded p-3 mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"
              }`}
            style={{ color: "#1f2937" }}
            editable={!isReleased()}
          />

          <TextInput
            placeholder="Tax Identification Number (TIN) *"
            value={tin}
            onChangeText={(text) => {
              if (!isReleased()) {
                const numericText = text.replace(/[^0-9]/g, ""); // numeric only
                setTin(numericText);
              }
            }}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
            className={`border rounded p-3 mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"
              }`}
            style={{ color: "#1f2937" }}
            editable={!isReleased()}
          />

          <TextInput
            ref={taxDeclarationRef}
            placeholder="Tax Declaration *"
            value={taxDeclaration}
            onChangeText={(text) => {
              if (!isReleased()) {
                const numericText = text.replace(/[^0-9]/g, "");
                setTaxDeclaration(numericText);
              }
            }}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
            className={`border rounded p-3 mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"
              }`}
            style={{ color: "#1f2937" }}
            editable={!isReleased()}
          />

          <TextInput
            ref={propertyIndexRef}
            placeholder="Property Index *"
            value={propertyIndex}
            onChangeText={(text) => {
              if (!isReleased()) {
                const numericText = text.replace(/[^0-9]/g, "");
                setPropertyIndex(numericText);
              }
            }}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
            className={`border rounded p-3 mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"
              }`}
            style={{ color: "#1f2937" }}
            editable={!isReleased()}
          />


          {quatityInformation.map((field, idx) => (
            <TextInput
              key={idx}
              ref={field.placeholder === "Business Area (in sq m)*" ? businessAreaRef : undefined}
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={(text) => {
                if (!isReleased()) {
                  const numericText = text.replace(/[^0-9.]/g, '');
                  field.setter(numericText);
                }
              }}
              keyboardType={field.keyboard ?? "default"}
              placeholderTextColor="#9ca3af"
              className={`border rounded p-3 mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"
                }`}
              style={{ color: '#1f2937' }}
              editable={!isReleased()}
            />
          ))}

          <Text className="text-base font-semibold text-gray-700 mb-2">Owned:</Text>
          <View className="flex-row mb-6">
            {(["yes", "no"] as Owned[]).map((g) => (
              <Pressable key={g} className="flex-row items-center mr-6" onPress={() => setOwned(g)}>
                <View className={`w-5 h-5 mr-2 border-2 rounded items-center justify-center ${owned === g ? "bg-red-500 border-red-500" : "border-gray-400"}`}>
                  {owned === g && <Check size={14} color="white" strokeWidth={3} />}
                </View>
                <Text className="capitalize">{g}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-lg font-bold text-gray-800 mb-4 mt-8">Tax Payer Address</Text>


          <Text className="text-base font-semibold text-gray-700 mb-1">Region *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={region} onValueChange={handleTaxpayerRegionChange} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Region" value="" />
              {regions.map((reg) => (
                <Picker.Item
                  key={reg.id}
                  label={reg.description ? `${reg.name} - ${reg.description}` : reg.name}
                  value={reg.name}
                />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Province *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={province} onValueChange={handleTaxpayerProvinceChange}
              enabled={taxpayerProvinces.length > 0} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Province" value="" />
              {taxpayerProvinces.map((prov) => (
                <Picker.Item key={prov.id} label={prov.name} value={prov.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Municipality *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={municipality} onValueChange={handleTaxpayerMunicipalityChange}
              enabled={taxpayerMunicipalities.length > 0} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Municipality" value="" />
              {taxpayerMunicipalities.map((muni) => (
                <Picker.Item key={muni.id} label={muni.name} value={muni.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Barangay *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={barangay} onValueChange={handleTaxpayerBarangayChange}
              enabled={taxpayerBarangays.length > 0} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Barangay" value="" />
              {taxpayerBarangays.map((brgy) => (
                <Picker.Item key={brgy.id} label={brgy.name} value={brgy.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Zip Code</Text>
          <StyledTextInput value={zipcode} editable={false} placeholder="Auto-filled from Barangay"
            className="border border-gray-300 rounded p-3 mb-3 bg-gray-100 text-gray-600" />

          {payerAddress.map((field, idx) => (
            <TextInput
              key={idx}
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={(text) => {
                if (!isReleased()) {
                  field.setter(text);
                }
              }}
              placeholderTextColor="#9ca3af"
              className={`border rounded p-3 mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"
                }`}
              style={{ color: '#1f2937' }}
              editable={!isReleased()}
            />
          ))}


          <Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Main Office Address</Text>

          <Pressable onPress={() => handleSameAsPayer(!sameAsPayer)} className="flex-row items-center mb-4">
            <View className={`w-5 h-5 mr-2 border-2 rounded items-center justify-center ${sameAsPayer ? "bg-red-500 border-red-500" : "border-gray-400"
              }`}>
              {sameAsPayer && <Check size={14} color="white" strokeWidth={3} />}
            </View>
            <Text className="text-gray-700">Same as Taxpayer Address</Text>
          </Pressable>

          <Text className="text-base font-semibold text-gray-700 mb-1">Region *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={bisRegion} onValueChange={handleBusinessRegionChange}
              enabled={!sameAsPayer} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Region" value="" />
              {regions.map((reg) => (
                <Picker.Item
                  key={reg.id}
                  label={reg.description ? `${reg.name} - ${reg.description}` : reg.name}
                  value={reg.name}
                />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Province *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={bisProvince} onValueChange={handleBusinessProvinceChange}
              enabled={businessProvinces.length > 0 && !sameAsPayer} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Province" value="" />
              {businessProvinces.map((prov) => (
                <Picker.Item key={prov.id} label={prov.name} value={prov.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Municipality *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={bisMunicipality} onValueChange={handleBusinessMunicipalityChange}
              enabled={businessMunicipalities.length > 0 && !sameAsPayer} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Municipality" value="" />
              {businessMunicipalities.map((muni) => (
                <Picker.Item key={muni.id} label={muni.name} value={muni.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Barangay *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={bisBarangay} onValueChange={handleBusinessBarangayChange}
              enabled={businessBarangays.length > 0 && !sameAsPayer} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Barangay" value="" />
              {businessBarangays.map((brgy) => (
                <Picker.Item key={brgy.id} label={brgy.name} value={brgy.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Zip Code</Text>
          <StyledTextInput value={bisZipcode} editable={false} placeholder="Auto-filled from Barangay"
            className="border border-gray-300 rounded p-3 mb-3 bg-gray-100 text-gray-600" />

          {mainOfficeAddress.map((field, idx) => (
            <TextInput
              key={idx}
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={(text) => {
                if (!sameAsPayer) {
                  const numericText = text.replace(/[^0-9.]/g, '');
                  field.setter(numericText);
                }
              }}
              placeholderTextColor="#9ca3af"
              className={`border rounded p-3 mb-3 ${sameAsPayer ? "border-gray-300 bg-gray-200" : "border-gray-400"
                }`}
              style={{ color: "#1f2937" }}
              editable={!sameAsPayer}
            />
          ))}


          <Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Contact Information</Text>
          {contactInformation.map((field, idx) => (
            <TextInput
              key={idx}
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={(text) => {
                if (!isReleased()) {
                  // Apply simple validation depending on field type
                  let updatedText = text;

                  // If the keyboard is numeric, only allow digits
                  if (field.keyboard === "numeric") {
                    updatedText = text.replace(/[^0-9]/g, "");
                  }

                  // If it looks like an email field, prevent spaces
                  if (field.placeholder?.toLowerCase().includes("email")) {
                    updatedText = text.replace(/\s/g, "");
                  }

                  field.setter(updatedText);
                }
              }}
              keyboardType={field.keyboard ?? "default"}
              placeholderTextColor="#9ca3af"
              className={`border rounded p-3 mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"
                }`}
              style={{ color: "#1f2937" }}
              editable={!isReleased()}
            />
          ))}


          <Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Lease Information</Text>
          {leaseInformation.map((field, idx) => (
            <TextInput
              key={idx}
              ref={
                field.placeholder === "Lease Area (in sq m)*"
                  ? leaseAreaRef // optional: replace with your actual ref name if needed
                  : undefined
              }
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={(text) => {
                if (!isReleased()) {
                  // Allow only numbers and dot for numeric fields
                  const numericText =
                    field.keyboard === "numeric"
                      ? text.replace(/[^0-9.]/g, "")
                      : text;
                  field.setter(numericText);
                }
              }}
              keyboardType={field.keyboard ?? "default"}
              placeholderTextColor="#9ca3af"
              className={`border rounded p-3 mb-3 ${isReleased() ? "border-gray-300 bg-gray-200" : "border-gray-400"
                }`}
              style={{ color: "#1f2937" }}
              editable={!isReleased()}
            />
          ))}


          <Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Business Location Address</Text>

          <Pressable onPress={() => handleSameAsMain(!sameAsMain)} className="flex-row items-center mb-4">
            <View className={`w-5 h-5 mr-2 border-2 rounded items-center justify-center ${sameAsMain ? "bg-red-500 border-red-500" : "border-gray-400"
              }`}>
              {sameAsMain && <Check size={14} color="white" strokeWidth={3} />}
            </View>
            <Text className="text-gray-700">Same as Main Office Address</Text>
          </Pressable>

          <Text className="text-base font-semibold text-gray-700 mb-1">Region *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={locRegion} onValueChange={handleLocationRegionChange}
              enabled={!sameAsMain} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Region" value="" />
              {regions.map((reg) => (
                <Picker.Item
                  key={reg.id}
                  label={reg.description ? `${reg.name} - ${reg.description}` : reg.name}
                  value={reg.name}
                />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Province *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={locProvince} onValueChange={handleLocationProvinceChange}
              enabled={locationProvinces.length > 0 && !sameAsMain} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Province" value="" />
              {locationProvinces.map((prov) => (
                <Picker.Item key={prov.id} label={prov.name} value={prov.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Municipality *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={locMunicipality} onValueChange={handleLocationMunicipalityChange}
              enabled={locationMunicipalities.length > 0 && !sameAsMain} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Municipality" value="" />
              {locationMunicipalities.map((muni) => (
                <Picker.Item key={muni.id} label={muni.name} value={muni.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Barangay *</Text>
          <View className="border border-gray-400 rounded mb-3">
            <Picker selectedValue={locBarangay} onValueChange={handleLocationBarangayChange}
              enabled={locationBarangays.length > 0 && !sameAsMain} style={{ color: '#1f2937', backgroundColor: '#ffffff' }} dropdownIconColor="#1f2937">
              <Picker.Item label="Select Barangay" value="" />
              {locationBarangays.map((brgy) => (
                <Picker.Item key={brgy.id} label={brgy.name} value={brgy.name} />
              ))}
            </Picker>
          </View>

          <Text className="text-base font-semibold text-gray-700 mb-1">Zip Code</Text>
          <StyledTextInput value={locZipcode} editable={false} placeholder="Auto-filled from Barangay"
            className="border border-gray-300 rounded p-2 mb-3 bg-gray-100 text-gray-600" />

          {businessLocationAddress.map((field, idx) => (
            <TextInput
              key={idx}
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={(text) => {
                if (!sameAsMain) {
                  field.setter(text);
                }
              }}
              placeholderTextColor="#9ca3af"
              className={`border rounded p-3 mb-3 ${sameAsMain ? "border-gray-300 bg-gray-200" : "border-gray-400"
                }`}
              style={{ color: "#1f2937" }}
              editable={!sameAsMain}
            />
          ))}


          <Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Documentary Requirements</Text>

          {municipalityAttachments.length === 0 ? (
            <Text className="text-gray-500 mb-4">No attachments configured for this municipality</Text>
          ) : (
            municipalityAttachments.map((attachment) => {
              // Find existing attachment for this requirement
              const existingAttachment = existingAttachments.find(
                att => att.attachmentId === attachment.id
              );

              return (
                <View key={attachment.id} className="mb-3">
                  <Pressable
                    className={`border rounded p-3 ${isReleased()
                      ? "border-gray-300 bg-gray-200"
                      : "border-gray-400"
                      }`}
                    onPress={() => {
                      if (!isReleased()) {
                        pickDocumentForAttachment(attachment.id);
                      }
                    }}
                    disabled={isReleased()}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className={`font-semibold ${isReleased() ? "text-gray-500" : ""}`}>
                            {attachment.title}
                            {attachment.required === 1 && !isReleased() && (
                              <Text className="text-red-500"> *</Text>
                            )}
                          </Text>
                        </View>
                        {attachment.description && (
                          <Text className="text-xs text-gray-600 mt-1">{attachment.description}</Text>
                        )}
                      </View>
                      <Text className="text-gray-500 ml-2">
                        {uploadedFiles[attachment.id]?.filename ||
                          (existingAttachment ? "" : (isReleased() ? "N/A" : "Upload"))}
                      </Text>
                    </View>

                    {/* Show existing attachment inline if it exists */}
                    {existingAttachment && (
                      <View className="mt-3 pt-3 border-t border-gray-200">
                        <View className="flex-row justify-between items-center bg-blue-50 rounded p-2">
                          <View className="flex-1 mr-2">
                            <Text className="text-sm font-medium text-gray-800">{existingAttachment.filename}</Text>
                            <Text className="text-xs text-gray-500 mt-1">Tap View to preview</Text>
                          </View>

                          <View className="flex-row gap-2">
                            {/* View Button */}
                            <Pressable
                              onPress={() => handleViewAttachment(existingAttachment.attachmentId, existingAttachment.filename)}
                              className="items-center justify-center rounded px-2 py-1"
                            >
                              <Eye size={20} color="#2563eb" />
                            </Pressable>

                            {/* Delete Button - only show if not released */}
                            {!isReleased() && (
                              <Pressable
                                onPress={() => handleDeleteAttachment(existingAttachment.attachmentId, existingAttachment.filename)}
                                className="items-center justify-center rounded px-2 py-1"
                              >
                                <Trash2 size={20} color="red" />
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })
          )}

          <Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Line of Business</Text>

          {/* ✅ UPDATED: Use isReleased() function */}
          <Pressable className={`flex-row items-center p-3 rounded mb-4 ${isReleased() ? "bg-gray-300" : "bg-red-500"}`}
            onPress={() => {
              console.log("Add Business Line pressed. isReleased:", isReleased());
              if (!isReleased()) {
                setBusinessModalVisible(true);
              }
            }}
            disabled={isReleased()}>
            <Plus size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Add Business Line</Text>
          </Pressable>



          {businessLines.map((item, idx) => (
            <View key={idx} className="border p-3 mb-3 rounded bg-gray-50 relative">
              <View className="flex-row items-center mb-2">
                <Text className="text-gray-700 font-bold">{item.code}</Text>
                {item.hasTerm && (
                  <View className="bg-blue-100 px-2 py-0.5 rounded ml-2">
                    <Text className="text-blue-700 text-xs">TERM</Text>
                  </View>
                )}
                {/* ✅ Add status indicator */}
                {isReleased() && (
                  <View className="bg-gray-100 px-2 py-0.5 rounded ml-2">
                    <Text className="text-gray-700 text-xs">READ-ONLY</Text>
                  </View>
                )}
              </View>

              <Text className="text-gray-700 mb-1">Name</Text>
              <StyledTextInput
                value={item.name}
                editable={false}
                className="border border-gray-300 rounded p-3 mb-3 bg-gray-200"
              />

              {item.description && (
                <>
                  <Text className="text-gray-700 mb-1">Description</Text>
                  <StyledTextInput
                    value={item.description}
                    editable={false}
                    multiline
                    className="border border-gray-300 rounded p-3 mb-3 bg-gray-200"
                  />
                </>
              )}

              <Text className="text-gray-700 mb-1">Units</Text>
              <TextInput
                placeholder="Number of Units"
                value={item.units}
                onChangeText={(text: string) => {
                  console.log("Trying to change units. isReleased:", isReleased());
                  if (!isReleased()) {
                    updateBusinessLine(idx, 'units', text);
                  }
                }}
                className={`border rounded p-3 mb-3 ${isReleased()
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-400 bg-white"
                  }`}
                keyboardType="numeric"
                editable={!isReleased()}
              />

              <Text className="text-gray-700 mb-1">Capital</Text>
              <TextInput
                placeholder="Capital Amount"
                value={item.capital}
                onChangeText={(text: string) => {
                  if (!isReleased()) {
                    updateBusinessLine(idx, 'capital', text);
                  }
                }}
                className={`border rounded p-3 mb-3 ${isReleased()
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-400 bg-white"
                  }`}
                keyboardType="numeric"
                editable={!isReleased()}
              />

              <Text className="text-gray-700 mb-1">Essential</Text>
              <TextInput
                placeholder="Essential Amount"
                value={item.essential}
                onChangeText={(text: string) => {
                  if (!isReleased()) {
                    updateBusinessLine(idx, 'essential', text);
                  }
                }}
                className={`border rounded p-3 mb-3 ${isReleased()
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-400 bg-white"
                  }`}
                keyboardType="numeric"
                editable={!isReleased()}
              />

              <Text className="text-gray-700 mb-1">Non-Essential</Text>
              <TextInput
                placeholder="Non-Essential Amount"
                value={item.nonEssential}
                onChangeText={(text: string) => {
                  if (!isReleased()) {
                    updateBusinessLine(idx, 'nonEssential', text);
                  }
                }}
                className={`border rounded p-3 mb-3 ${isReleased()
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-400 bg-white"
                  }`}
                keyboardType="numeric"
                editable={!isReleased()}
              />

              {!isReleased() && (
                <Pressable
                  className="absolute top-2 right-2"
                  onPress={() => removeBusinessLine(idx)}
                >
                  <Trash2 size={20} color="red" />
                </Pressable>
              )}
            </View>
          ))}




          <Modal visible={businessModalVisible} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-white w-[90%] max-h-[80%] p-4 rounded-lg">
                <Text className="text-lg font-bold mb-3">Search Business Line</Text>

                <TextInput
                  placeholder="Search by code or description..."
                  value={searchQuery}
                  onChangeText={handleSearchQueryChange}
                  className="border border-gray-400 rounded p-3 mb-3"
                  autoFocus
                />

                {isSearching && (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#DC2626" />
                    <Text className="text-gray-500 mt-2">Searching...</Text>
                  </View>
                )}

                {searchError && (
                  <View className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                    <Text className="text-red-600">{searchError}</Text>
                  </View>
                )}

                {!isSearching && searchQuery.length > 0 && businessLineResults.length === 0 && !searchError && (
                  <View className="py-4 items-center">
                    <Text className="text-gray-500">No results found</Text>
                  </View>
                )}

                <FlatList
                  data={businessLineResults}
                  keyExtractor={(item) => `${item.id}-${item.termId}`}
                  renderItem={({ item }) => (
                    <Pressable
                      className="p-3 border-b border-gray-200"
                      onPress={() => addBusinessLine(item)}
                    >
                      <View className="flex-row items-start">
                        <Text className="font-bold text-red-600 mr-2">{item.code}</Text>
                        {item.hasTerm && (
                          <View className="bg-blue-100 px-2 py-0.5 rounded mr-2">
                            <Text className="text-blue-700 text-xs">TERM</Text>
                          </View>
                        )}
                      </View>
                      <Text className="font-semibold mt-1">{item.name}</Text>
                      {item.description && (
                        <Text className="text-gray-600 text-sm mt-1">{item.description}</Text>
                      )}
                      {item.classification && (
                        <Text className="text-gray-500 text-xs mt-1">
                          Classification: {item.classification}
                        </Text>
                      )}
                      <Text className="text-gray-400 text-xs mt-1">
                        {item.sectionCode} - {item.sectionName}
                      </Text>
                    </Pressable>
                  )}
                />

                <Pressable
                  className="bg-red-500 p-3 rounded mt-3 items-center"
                  onPress={() => {
                    setBusinessModalVisible(false);
                    setSearchQuery("");
                    setBusinessLineResults([]);
                    setSearchError("");
                  }}
                >
                  <Text className="text-white">Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>



          {/* Measure and Pax */}
          <Text className="text-lg font-bold text-gray-800 mb-4 mt-4">Add Measure and Pax</Text>
          <Pressable
            className={`flex-row items-center p-3 rounded mb-4 ${businessLines.length === 0 || isReleased()
              ? "bg-gray-300"
              : "bg-red-500"}`}
            disabled={businessLines.length === 0 || isReleased()}
            onPress={() => setMeasureModalVisible(true)}>
            <Plus size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Add Measure and Pax</Text>
          </Pressable>


          {measures.map((m, idx) => (
            <View key={idx} className="border p-3 mb-3 rounded bg-gray-50 relative">
              {isReleased() && (
                <View className="bg-gray-100 px-2 py-0.5 rounded mb-2 self-start">
                  <Text className="text-gray-700 text-xs">READ-ONLY</Text>
                </View>
              )}

              <Text className="text-gray-700 mb-1">Units</Text>
              <TextInput value={m.units} onChangeText={(text: string) => {
                if (!isReleased()) { const updated = [...measures]; updated[idx].units = text; setMeasures(updated); }
              }}
                className={`border rounded p-3 mb-3 ${isReleased()
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-300 bg-white"
                  }`}
                keyboardType="numeric"
                editable={!isReleased()} />

              <Text className="text-gray-700 mb-1">Capacity</Text>
              <TextInput value={m.capacity} onChangeText={(text: string) => {
                if (!isReleased()) { const updated = [...measures]; updated[idx].capacity = text; setMeasures(updated); }
              }}
                className={`border rounded p-3 mb-3 ${isReleased()
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-300 bg-white"
                  }`}
                keyboardType="numeric"
                editable={!isReleased()} />

              <Text className="text-gray-700 mb-1">Measure</Text>
              <StyledTextInput value={m.measureName} editable={false} className="border border-gray-300 rounded p-3 mb-3 bg-gray-200" />

              <Text className="text-gray-700 mb-1">Line of Business</Text>
              <StyledTextInput value={m.lineBusiness} editable={false} className="border border-gray-300 rounded p-3 mb-3 bg-gray-200" />

              {!isReleased() && (
                <Pressable
                  className="absolute top-2 right-2"
                  onPress={() => setMeasures(measures.filter((_, i) => i !== idx))}
                >
                  <Trash2 size={20} color="red" />
                </Pressable>
              )}
            </View>
          ))}

          {/* Modal for Add Measure & Pax */}
          <Modal visible={measureModalVisible} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-center items-center">
              <View className="bg-white w-[90%] p-4 rounded-lg">
                <Text className="text-lg font-bold mb-3">Add Measure and Pax</Text>

                <Text className="text-base font-semibold text-gray-700 mb-1">Units</Text>
                <TextInput
                  placeholder="Number of Units"
                  value={units}
                  onChangeText={setUnits}
                  keyboardType="numeric"
                  className="border border-gray-400 rounded p-3 mb-3"
                />

                <Text className="text-base font-semibold text-gray-700 mb-1">Capacity</Text>
                <TextInput
                  placeholder="Capacity"
                  value={capacity}
                  onChangeText={setCapacity}
                  keyboardType="numeric"
                  className="border border-gray-400 rounded p-3 mb-3"
                />

                {/* Dropdown Measure/Pax */}
                <Text className="text-base font-semibold text-gray-700 mb-1">Measure/PAX</Text>
                <View className="border border-gray-400 rounded mb-3">
                  <Picker
                    selectedValue={measureId}
                    onValueChange={(itemValue) => {
                      setMeasureId(itemValue);
                      const selectedMeasure = municipalityMeasures.find(m => m.id.toString() === itemValue);
                      if (selectedMeasure) {
                        setMeasure(selectedMeasure.name);
                      }
                    }}
                  >
                    <Picker.Item label="Select Measure or Pax" value="" />
                    {municipalityMeasures.map((m) => (
                      <Picker.Item
                        key={m.id}
                        label={m.description ? `${m.name} - ${m.description}` : m.name}
                        value={m.id.toString()}
                      />
                    ))}
                  </Picker>
                </View>

                {/* Dropdown from Business Lines - AUTO-POPULATED */}
                <Text className="text-base font-semibold text-gray-700 mb-1">Line of Business</Text>
                <View className="border border-gray-400 rounded mb-3">
                  <Picker
                    selectedValue={selectedBusinessLineId}
                    onValueChange={(itemValue) => {
                      setSelectedBusinessLineId(itemValue);
                      const selectedLine = businessLines.find(line => line.id.toString() === itemValue);
                      if (selectedLine) {
                        setLineBusiness(`${selectedLine.code} - ${selectedLine.name}`);
                      }
                    }}
                  >
                    <Picker.Item label="Select Line of Business" value="" />
                    {businessLines.map((line) => (
                      <Picker.Item
                        key={line.id}
                        label={`${line.code} - ${line.name}`}
                        value={line.id.toString()}
                      />
                    ))}
                  </Picker>
                </View>

                {/* Information message if no business lines added yet */}
                {businessLines.length === 0 && (
                  <View className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                    <Text className="text-yellow-800 text-xs">
                      Please add a business line first before adding measures/PAX.
                    </Text>
                  </View>
                )}

                {/* Save + Close */}
                <View className="flex-row justify-between mt-2">
                  <Pressable
                    className="bg-gray-300 p-3 rounded w-[48%] items-center"
                    onPress={() => {
                      setMeasureModalVisible(false);
                      // Clear form
                      setUnits("");
                      setCapacity("");
                      setMeasure("");
                      setMeasureId("");
                      setLineBusiness("");
                      setSelectedBusinessLineId("");
                    }}
                  >
                    <Text className="font-semibold">Cancel</Text>
                  </Pressable>

                  <Pressable
                    className={`p-3 rounded w-[48%] items-center ${businessLines.length === 0 ? 'bg-gray-400' : 'bg-red-500'}`}
                    disabled={businessLines.length === 0}
                    onPress={() => {
                      if (units && capacity && measureId && selectedBusinessLineId) {
                        const selectedBusinessLine = businessLines.find(
                          line => line.id.toString() === selectedBusinessLineId);

                        if (selectedBusinessLine) {
                          setMeasures([...measures, {
                            businessLineId: selectedBusinessLineId,
                            measureId: measureId,
                            units,
                            capacity,
                            measureName: measure,
                            lineBusiness: `${selectedBusinessLine.code} - ${selectedBusinessLine.name}`
                          },
                          ]);
                          // Clear form
                          setUnits("");
                          setCapacity("");
                          setMeasure("");
                          setMeasureId("");
                          setLineBusiness("");
                          setSelectedBusinessLineId("");
                          setMeasureModalVisible(false);
                        } else {
                          Alert.alert("Error", "Selected business line not found");
                        }
                      } else {
                        Alert.alert("Missing Fields", "Please fill in all required fields");
                      }
                    }}>
                    <Text className="text-white font-semibold">Save</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>


          <View className="mb-10">
            <Pressable
              className={`rounded p-3 items-center ${isSubmitting ? 'bg-gray-400' : 'bg-red-500'}`}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold ml-2">
                    {isRenewalMode
                      ? "Creating Renewal..."
                      : isUpdateMode
                        ? "Updating..."
                        : "Submitting..."}
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">
                  {isRenewalMode
                    ? "🔄 Submit Renewal (New Application)"
                    : isUpdateMode
                      ? "Update Application"
                      : "Submit Application"}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* ✅ ATTACHMENT VIEWER MODAL  */}
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
    </View>
  );
};

export default Fillup;