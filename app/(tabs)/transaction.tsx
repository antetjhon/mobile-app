import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Building2, Calendar, CreditCard, DollarSign, FileText, Hash, List, Receipt, RefreshCw, User, X, } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, RefreshControl, ScrollView, Text, View, } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { getApiUrl } from "../utils/api";

interface Payer {
    lastname: string;
    firstname: string;
    middlename: string;
    suffix: string;
}

interface PaymentFee {
    id: number;
    feeId: number;
    feeName: string;
    rate: number;
    interest: number;
    surcharge: number;
    payed: number;
    months: number;
}

interface Transaction {
    id: number;
    applicationId: number;
    reference: string;
    businessName: string;
    receiptNo: number;
    paymentDate: string;
    paymentOption: number;
    paymentMode: number
    payer: Payer;
    createdTimestamp: string;
    totalAmount: number;
}

interface TransactionDetail extends Transaction {
    fees: PaymentFee[];
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface TransactionsResponse {
    transactions: Transaction[];
    pagination: PaginationInfo;
}

const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateString;
    }
};

const formatDateTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateString;
    }
};

const formatCurrency = (amount: number): string => {
    return `₱${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatPayerName = (payer: Payer): string => {
    const parts = [payer.firstname, payer.middlename, payer.lastname];
    const name = parts.filter(Boolean).join(" ");
    return payer.suffix ? `${name} ${payer.suffix}` : name;
};

const getPaymentOptionLabel = (option: number): string => {
    switch (option) {
        case 0:
            return "Cash";
        case 1:
            return "Check";
        case 2:
            return "Money Order";
        case 3:
            return "Online Payment";
        default:
            return "Other";
    }
};

const getPaymentOptionColor = (option: number): string => {
    switch (option) {
        case 0:
            return "bg-green-100";
        case 1:
            return "bg-blue-100";
        case 2:
            return "bg-purple-100";
        case 3:
            return "bg-indigo-100";
        default:
            return "bg-gray-100";
    }
};

const getPaymentOptionTextColor = (option: number): string => {
    switch (option) {
        case 0:
            return "text-green-700";
        case 1:
            return "text-blue-700";
        case 2:
            return "text-purple-700";
        case 3:
            return "text-indigo-700";
        default:
            return "text-gray-700";
    }
};

// Add these helper functions after formatPayerName (around line 110)
const getPaymentModeLabel = (mode: number): string => {
    switch (mode) {
        case 0:
            return "Annual";
        case 1:
            return "Half";
        case 2:
            return "Quarter";
        default:
            return "Unknown";
    }
};

const getPaymentModeColor = (mode: number): string => {
    switch (mode) {
        case 0:
            return "bg-amber-100";
        case 1:
            return "bg-teal-100";
        case 2:
            return "bg-cyan-100";
        default:
            return "bg-gray-100";
    }
};

const getPaymentModeTextColor = (mode: number): string => {
    switch (mode) {
        case 0:
            return "text-amber-700";
        case 1:
            return "text-teal-700";
        case 2:
            return "text-cyan-700";
        default:
            return "text-gray-700";
    }
};

const TransactionDetailsModal = ({
    visible,
    transaction,
    onClose
}: {
    visible: boolean;
    transaction: TransactionDetail | null;
    onClose: () => void;
}) => {
    if (!transaction) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl max-h-[85%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
                        <Text className="text-2xl font-bold text-gray-800">
                            Transaction Details
                        </Text>
                        <Pressable
                            onPress={onClose}
                            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                        >
                            <X color="#374151" size={24} />
                        </Pressable>
                    </View>

                    <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                        {/* Status Badge */}
                        <View className="items-center mb-6">
                            <View className="bg-green-100 px-6 py-3 rounded-full">
                                <Text className="text-green-700 font-bold text-lg">
                                    ✓ PAID
                                </Text>
                            </View>
                        </View>

                        {/* Amount */}
                        <View className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl mb-6">
                            <Text className="text-gray-600 text-sm mb-2 text-center">
                                Total Amount Paid
                            </Text>
                            <Text className="text-4xl font-bold text-center text-purple-600">
                                {formatCurrency(transaction.totalAmount)}
                            </Text>
                        </View>

                        {/* Details Grid */}
                        <View className="space-y-4 mb-6">
                            {/* Receipt Number */}
                            <View className="bg-gray-50 p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <Receipt color="black" size={20} />
                                    </View>
                                    <Text className="text-gray-500 text-sm">Receipt Number</Text>
                                </View>
                                <Text className="text-gray-800 font-bold text-lg ml-13">
                                    #{transaction.receiptNo}
                                </Text>
                            </View>

                            {/* Business Name */}
                            <View className="bg-gray-50 p-4 rounded-xl b-3 shadow-sm flex-row items-center justify-between">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <Building2 color="black" size={20} />
                                    </View>
                                    <Text className="text-gray-500 text-sm">Business Name</Text>
                                </View>
                                <Text className="text-gray-800 font-bold text-lg ml-13">
                                    {transaction.businessName}
                                </Text>
                            </View>

                            {/* Reference */}
                            <View className="bg-gray-50 p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <Hash color="black" size={20} />
                                    </View>
                                    <Text className="text-gray-500 text-sm">Application Reference</Text>
                                </View>
                                <Text className="text-gray-800 font-bold text-lg ml-13">
                                    {transaction.reference}
                                </Text>
                            </View>

                            {/* Payment Method */}
                            <View className="bg-gray-50 p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <CreditCard color="black" size={20} />
                                    </View>
                                    <Text className="text-gray-500 text-sm">Payment Method</Text>
                                </View>
                                <Text className="text-gray-800 font-bold text-lg ml-13">
                                    {getPaymentOptionLabel(transaction.paymentOption)}
                                </Text>
                            </View>
                            {/* Payment Mode */}
                            <View className="bg-gray-50 p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <Calendar color="black" size={20} />
                                    </View>
                                    <Text className="text-gray-500 text-sm">Payment Mode</Text>
                                </View>
                                <Text className="text-gray-800 font-bold text-lg ml-13">
                                    {getPaymentModeLabel(transaction.paymentMode)}
                                </Text>
                            </View>

                            {/* Payment Date */}
                            <View className="bg-gray-50 p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <Calendar color="black" size={20} />
                                    </View>
                                    <Text className="text-gray-500 text-sm">Payment Date</Text>
                                </View>
                                <Text className="text-gray-800 font-bold text-lg ml-13">
                                    {formatDate(transaction.paymentDate)}
                                </Text>
                            </View>

                            {/* Paid By */}
                            <View className="bg-gray-50 p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <User color="black" size={20} />
                                    </View>
                                    <Text className="text-gray-500 text-sm">Paid By</Text>
                                </View>
                                <Text className="text-gray-800 font-bold text-lg ml-13">
                                    {formatPayerName(transaction.payer)}
                                </Text>
                            </View>
                        </View>

                        {/* Fee Breakdown */}
                        {transaction.fees && transaction.fees.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center mb-4">
                                    <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-3">
                                        <List color="#10b981" size={20} />
                                    </View>
                                    <Text className="text-lg font-bold text-gray-800">
                                        Fee Breakdown
                                    </Text>
                                </View>

                                {/* Fee List */}
                                <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    {transaction.fees.map((fee, index) => (
                                        <View
                                            key={fee.id}
                                            className={`${index !== 0 ? 'pt-3 border-t border-gray-200' : ''}`}
                                        >
                                            <Text className="font-semibold text-gray-800 mb-2">
                                                {fee.feeName}
                                            </Text>

                                            <View className="ml-2 space-y-1">
                                               
                                                {fee.interest > 0 && (
                                                    <View className="flex-row justify-between">
                                                        <Text className="text-gray-600 text-sm">Interest:</Text>
                                                        <Text className="text-orange-600 font-medium">
                                                            {formatCurrency(fee.interest)}
                                                        </Text>
                                                    </View>
                                                )}

                                                {fee.surcharge > 0 && (
                                                    <View className="flex-row justify-between">
                                                        <Text className="text-gray-600 text-sm">Surcharge:</Text>
                                                        <Text className="text-red-600 font-medium">
                                                            {formatCurrency(fee.surcharge)}
                                                        </Text>
                                                    </View>
                                                )}

                                                {fee.months > 0 && (
                                                    <View className="flex-row justify-between">
                                                        <Text className="text-gray-600 text-sm">Months:</Text>
                                                        <Text className="text-gray-800 font-medium">
                                                            {fee.months}
                                                        </Text>
                                                    </View>
                                                )}

                                                <View className="flex-row justify-between pt-1 border-t border-gray-300 mt-1">
                                                    <Text className="text-gray-800 font-semibold">Paid:</Text>
                                                    <Text className="text-green-600 font-bold">
                                                        {formatCurrency(fee.payed)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}

                                    {/* Total */}
                                    <View className="pt-3 border-t-2 border-gray-300">
                                        <View className="flex-row justify-between">
                                            <Text className="font-bold text-gray-800 text-lg">
                                                Total Amount:
                                            </Text>
                                            <Text className="font-bold text-green-600 text-lg">
                                                {formatCurrency(transaction.totalAmount)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Close Button */}
                        <Pressable
                            onPress={onClose}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-xl mb-6"
                        >
                            <Text className="text-white font-bold text-center text-lg">
                                Close
                            </Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
const TransactionCard = ({
    transaction,
    onPress
}: {
    transaction: Transaction;
    onPress: () => void;
}) => (
    <Pressable
        onPress={onPress}
        className="bg-white/95 rounded-2xl p-5 mb-4 shadow-md active:opacity-80"
    >
        {/* Header - ONLY ONE VERSION */}
        <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-3">
                <Text className="text-gray-800 font-bold text-lg mb-1">
                    {transaction.businessName}
                </Text>
                <View className="flex-row items-center">
                    <FileText color="#6b7280" size={14} />
                    <Text className="text-gray-600 text-sm ml-1">
                        Ref: {transaction.reference}
                    </Text>
                </View>
            </View>
            <View className="flex-col space-y-2">
                <View className={`${getPaymentOptionColor(transaction.paymentOption)} px-3 py-1 rounded-full`}>
                    <Text className={`${getPaymentOptionTextColor(transaction.paymentOption)} font-semibold text-xs`}>
                        {getPaymentOptionLabel(transaction.paymentOption)}
                    </Text>
                </View>
                <View className={`${getPaymentModeColor(transaction.paymentMode)} px-3 py-1 rounded-full`}>
                    <Text className={`${getPaymentModeTextColor(transaction.paymentMode)} font-semibold text-xs`}>
                        {getPaymentModeLabel(transaction.paymentMode)}
                    </Text>
                </View>
            </View>
        </View>

        {/* Divider */}
        <View className="border-b border-gray-200 mb-4" />

        {/* Details */}
        <View className="space-y-3">
            {/* Receipt */}
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <Receipt color="#9333ea" size={16} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Receipt Number</Text>
                    <Text className="text-gray-800 font-semibold">
                        #{transaction.receiptNo}
                    </Text>
                </View>
            </View>

            {/* Date */}
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Calendar color="#3b82f6" size={16} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Payment Date</Text>
                    <Text className="text-gray-800 font-semibold">
                        {formatDate(transaction.paymentDate)}
                    </Text>
                </View>
            </View>

            {/* Payer */}
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center mr-3">
                    <User color="#f97316" size={16} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Paid By</Text>
                    <Text className="text-gray-800 font-semibold">
                        {formatPayerName(transaction.payer)}
                    </Text>
                </View>
            </View>

            {/* Amount */}
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                    <DollarSign color="#22c55e" size={16} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Total Amount</Text>
                    <Text className="text-green-600 font-bold text-xl">
                        {formatCurrency(transaction.totalAmount)}
                    </Text>
                </View>
            </View>
        </View>

        {/* Tap to view indicator */}
        <View className="mt-4 pt-3 border-t border-gray-100">
            <Text className="text-gray-400 text-xs text-center">
                Tap to view full details
            </Text>
        </View>
    </Pressable>
);
const EmptyState = () => (
    <View className="items-center justify-center py-16 px-6">
        <View className="bg-white/20 rounded-full p-6 mb-4">
            <Receipt color="#fff" size={48} />
        </View>
        <Text className="text-white text-xl font-bold mb-2">
            No Transactions Yet
        </Text>
        <Text className="text-white/70 text-center text-base">
            Your payment transactions will appear here once you make a payment.
        </Text>
    </View>
);

export default function Transactions() {
    const router = useRouter();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchTransactions = async (page: number = 1, isRefresh: boolean = false) => {
        if (!user) {
            console.log("[TRANSACTIONS] No user, skipping fetch");
            return;
        }

        try {
            if (isRefresh) {
                setRefreshing(true);
            } else if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const API_URL = await getApiUrl();
            const response = await axios.get<TransactionsResponse>(
                `${API_URL}/transactions`,
                {
                    params: { page, limit: 20 },
                    withCredentials: true,
                }
            );

            if (response.data) {
                if (page === 1 || isRefresh) {
                    setTransactions(response.data.transactions);
                } else {
                    setTransactions((prev) => [...prev, ...response.data.transactions]);
                }
                setPagination(response.data.pagination);
                setCurrentPage(page);
            }
        } catch (err: any) {
            console.error("Error fetching transactions:", err);

            if (axios.isAxiosError(err) && err.response) {
                const status = err.response.status;
                const errorData = err.response.data;
                const errorMsg = errorData?.error || "Failed to load transactions";

                if (status === 401) {
                    Alert.alert(
                        "Session Expired",
                        "Please log in again to view your transactions.",
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    clearTransactionData();
                                    router.replace("/");
                                },
                            },
                        ]
                    );
                } else {
                    Alert.alert("Error", errorMsg);
                }
            } else {
                Alert.alert(
                    "Connection Error",
                    "Unable to connect to server. Please check your internet connection."
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const fetchTransactionDetails = async (paymentId: number) => {
        try {
            setLoadingDetails(true);
            const API_URL = await getApiUrl();
            const response = await axios.get(
                `${API_URL}/transactions/${paymentId}/fees`,
                { withCredentials: true }
            );

            return response.data.fees || [];
        } catch (err: any) {
            console.error("Error fetching transaction details:", err);
            Alert.alert("Error", "Failed to load transaction details");
            return [];
        } finally {
            setLoadingDetails(false);
        }
    };

    const clearTransactionData = () => {
        setTransactions([]);
        setPagination(null);
        setCurrentPage(1);
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        setSelectedTransaction(null);
        setModalVisible(false);
        console.log("✅ [TRANSACTIONS] All data cleared");
    };

    const handleTransactionPress = async (transaction: Transaction) => {
        setModalVisible(true);

        // Fetch fee details
        const fees = await fetchTransactionDetails(transaction.id);

        const detailedTransaction: TransactionDetail = {
            ...transaction,
            fees: fees
        };

        setSelectedTransaction(detailedTransaction);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setTimeout(() => setSelectedTransaction(null), 300);
    };

    useEffect(() => {
        return () => {
            console.log("[TRANSACTIONS] Component unmounting, clearing data...");
            clearTransactionData();
        };
    }, []);

    useEffect(() => {
        if (user) {
            fetchTransactions(1);
        } else {
            clearTransactionData();
        }
    }, [user]);

    const handleRefresh = useCallback(() => {
        fetchTransactions(1, true);
    }, []);

    const handleLoadMore = () => {
        if (
            !loadingMore &&
            pagination &&
            currentPage < pagination.totalPages
        ) {
            fetchTransactions(currentPage + 1);
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-4">
                <ActivityIndicator size="small" color="#fff" />
            </View>
        );
    };

    return (
        <LinearGradient
            colors={["#c850c0", "#4158d0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1"
        >
            {/* Header */}
            <View className="pt-14 pb-6 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <Pressable
                        onPress={() => router.push("/home")}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                    >
                        <ArrowLeft color="#fff" size={24} />
                    </Pressable>

                    <Pressable
                        onPress={() => fetchTransactions(1, true)}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                    >
                        <RefreshCw color="#fff" size={20} />
                    </Pressable>
                </View>

                <View className="flex-row items-center mb-2">
                    <View className="bg-white/20 rounded-full p-3 mr-3">
                        <CreditCard color="#fff" size={28} />
                    </View>
                    <View>
                        <Text className="text-3xl font-bold text-white">
                            Transactions
                        </Text>
                        {pagination && (
                            <Text className="text-white/80 text-sm mt-1">
                                {pagination.total} {pagination.total === 1 ? "payment" : "payments"} total
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white text-base mt-4">
                        Loading transactions...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={({ item }) => (
                        <TransactionCard
                            transaction={item}
                            onPress={() => handleTransactionPress(item)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingBottom: 24,
                    }}
                    ListEmptyComponent={<EmptyState />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#fff"
                            colors={["#fff"]}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Transaction Details Modal */}
            <TransactionDetailsModal
                visible={modalVisible}
                transaction={selectedTransaction}
                onClose={handleCloseModal}
            />
        </LinearGradient>
    );
}