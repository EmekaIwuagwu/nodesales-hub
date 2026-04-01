using System.Globalization;

namespace KortanaWallet.Core.Converters
{
    public class StepToVisibilityConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is int currentStep && parameter is string targetStepStr && int.TryParse(targetStepStr, out int targetStep))
            {
                return currentStep == targetStep;
            }
            return false;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class TabToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            bool isMnemonicTab = (bool)value;
            bool targetMnemonic = bool.Parse((string)parameter);
            
            // Should return actual static resource or hex
            return isMnemonicTab == targetMnemonic ? Color.FromArgb("#4D6CFA") : Color.FromArgb("00000000");
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class PinDotConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            int currentLength = (int)value;
            int dotIndex = int.Parse((string)parameter);
            
            return currentLength >= dotIndex ? Color.FromArgb("#4D6CFA") : Color.FromArgb("22FFFFFF");
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class InvertedBoolConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return !(bool)value;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return !(bool)value;
        }
    }
}
