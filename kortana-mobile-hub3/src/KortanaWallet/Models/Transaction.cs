using CommunityToolkit.Mvvm.ComponentModel;
using System;

namespace KortanaWallet.Models
{
    public enum TransactionStatus
    {
        Pending,
        Confirmed,
        Failed
    }

    public enum TransactionDirection
    {
        Sent,
        Received,
        Swap
    }

    public partial class Transaction : ObservableObject
    {
        [ObservableProperty]
        private string _hash;

        [ObservableProperty]
        private string _fromAddress;

        [ObservableProperty]
        private string _toAddress;

        [ObservableProperty]
        private double _amount;

        [ObservableProperty]
        private string _tokenSymbol;

        [ObservableProperty]
        private DateTime _timestamp;

        [ObservableProperty]
        private TransactionStatus _status;

        [ObservableProperty]
        private TransactionDirection _direction;

        [ObservableProperty]
        private decimal _gasFeeUsd;

        [ObservableProperty]
        private decimal _valueUsd;

        public string DisplayAmount => $"{(Direction == TransactionDirection.Sent ? "-" : "+")}{Amount} {TokenSymbol}";
        
        public string RelativeTime => GetRelativeTime(Timestamp);

        private static string GetRelativeTime(DateTime dateTime)
        {
            var span = DateTime.Now - dateTime;
            if (span.TotalMinutes < 1) return "Just now";
            if (span.TotalHours < 1) return $"{Math.Floor(span.TotalMinutes)}m ago";
            if (span.TotalDays < 1) return $"{Math.Floor(span.TotalHours)}h ago";
            return dateTime.ToString("MMM dd, yyyy");
        }
    }
}
