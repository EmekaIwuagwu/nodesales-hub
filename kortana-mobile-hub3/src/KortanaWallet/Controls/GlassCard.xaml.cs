namespace KortanaWallet.Controls;

public partial class GlassCard : ContentView
{
	public GlassCard()
	{
		InitializeComponent();
	}

    public static readonly BindableProperty StrokeShapeProperty = 
        BindableProperty.Create(nameof(StrokeShape), typeof(IShape), typeof(GlassCard), null, propertyChanged: (b, o, n) => 
        {
            var card = (GlassCard)b;
            if (card.MainBorder != null) card.MainBorder.StrokeShape = (IShape)n;
        });

    public IShape StrokeShape
    {
        get => (IShape)GetValue(StrokeShapeProperty);
        set => SetValue(StrokeShapeProperty, value);
    }
}
