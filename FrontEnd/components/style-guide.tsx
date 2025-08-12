import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">StreamNews Style Guide</h1>
          <p className="text-gray-400 text-lg">
            Design system and component specifications for the StreamNews platform
          </p>
        </div>

        {/* Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Primary Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-600 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Red 600</p>
                    <p className="text-sm text-gray-400">#DC2626</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-700 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Red 700</p>
                    <p className="text-sm text-gray-400">#B91C1C</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Background Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-black rounded-lg border border-gray-700"></div>
                  <div>
                    <p className="font-medium">Black</p>
                    <p className="text-sm text-gray-400">#000000</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-950 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Gray 950</p>
                    <p className="text-sm text-gray-400">#030712</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Gray 900</p>
                    <p className="text-sm text-gray-400">#111827</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Text Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-lg"></div>
                  <div>
                    <p className="font-medium">White</p>
                    <p className="text-sm text-gray-400">#FFFFFF</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Gray 300</p>
                    <p className="text-sm text-gray-400">#D1D5DB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-400 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Gray 400</p>
                    <p className="text-sm text-gray-400">#9CA3AF</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Accent Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Yellow 500</p>
                    <p className="text-sm text-gray-400">#EAB308</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Green 600</p>
                    <p className="text-sm text-gray-400">#16A34A</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Typography</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 space-y-8">
              <div>
                <h1 className="text-5xl font-bold mb-2">Heading 1</h1>
                <p className="text-gray-400">text-5xl font-bold - Used for main page titles</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Heading 2</h2>
                <p className="text-gray-400">text-3xl font-bold - Used for section titles</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Heading 3</h3>
                <p className="text-gray-400">text-xl font-semibold - Used for card titles</p>
              </div>
              <div>
                <p className="text-base mb-2">Body Text</p>
                <p className="text-gray-400">text-base - Used for main content</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Small Text</p>
                <p className="text-gray-400">text-sm text-gray-400 - Used for metadata</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Spacing */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Spacing System</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="w-4 h-4 bg-red-600 mb-2"></div>
                  <p className="font-medium">4px</p>
                  <p className="text-sm text-gray-400">space-1</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-red-600 mb-2"></div>
                  <p className="font-medium">8px</p>
                  <p className="text-sm text-gray-400">space-2</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-red-600 mb-2"></div>
                  <p className="font-medium">12px</p>
                  <p className="text-sm text-gray-400">space-3</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-red-600 mb-2"></div>
                  <p className="font-medium">16px</p>
                  <p className="text-sm text-gray-400">space-4</p>
                </div>
                <div>
                  <div className="w-20 h-20 bg-red-600 mb-2"></div>
                  <p className="font-medium">20px</p>
                  <p className="text-sm text-gray-400">space-5</p>
                </div>
                <div>
                  <div className="w-24 h-24 bg-red-600 mb-2"></div>
                  <p className="font-medium">24px</p>
                  <p className="text-sm text-gray-400">space-6</p>
                </div>
                <div>
                  <div className="w-32 h-32 bg-red-600 mb-2"></div>
                  <p className="font-medium">32px</p>
                  <p className="text-sm text-gray-400">space-8</p>
                </div>
                <div>
                  <div className="w-48 h-48 bg-red-600 mb-2"></div>
                  <p className="font-medium">48px</p>
                  <p className="text-sm text-gray-400">space-12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Component Specifications</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buttons */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button className="bg-red-600 hover:bg-red-700">Primary Button</Button>
                  <p className="text-sm text-gray-400">bg-red-600 hover:bg-red-700</p>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="border-gray-700 bg-transparent">
                    Secondary Button
                  </Button>
                  <p className="text-sm text-gray-400">variant="outline" border-gray-700</p>
                </div>
                <div className="space-y-2">
                  <Button variant="ghost">Ghost Button</Button>
                  <p className="text-sm text-gray-400">variant="ghost"</p>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-red-600">Featured</Badge>
                  <p className="text-sm text-gray-400">bg-red-600 (Featured content)</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">Category</Badge>
                  <p className="text-sm text-gray-400">variant="secondary" (Categories)</p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="border-gray-600">
                    Tag
                  </Badge>
                  <p className="text-sm text-gray-400">variant="outline" (Tags)</p>
                </div>
              </CardContent>
            </Card>

            {/* Cards */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Article Card</h3>
                    <p className="text-sm text-gray-400">bg-gray-900 border-gray-800 hover:bg-gray-800</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Form Elements */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input placeholder="Search..." className="bg-gray-800 border-gray-700" />
                  <p className="text-sm text-gray-400">bg-gray-800 border-gray-700</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Layout Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Layout Guidelines</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Breakpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">Mobile: 0px - 767px</p>
                  <p className="text-sm text-gray-400">Single column layout, stacked navigation</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Tablet: 768px - 1023px</p>
                  <p className="text-sm text-gray-400">2-3 column grid, collapsible sidebar</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Desktop: 1024px+</p>
                  <p className="text-sm text-gray-400">Full layout, 4-6 column grids</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Grid System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">Container: max-w-7xl mx-auto</p>
                  <p className="text-sm text-gray-400">Maximum width with centered alignment</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Padding: px-4 sm:px-6 lg:px-8</p>
                  <p className="text-sm text-gray-400">Responsive horizontal padding</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Gaps: gap-4 md:gap-6 lg:gap-8</p>
                  <p className="text-sm text-gray-400">Responsive grid gaps</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Animation Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Animation & Transitions</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Hover Effects</h3>
                <p className="text-gray-400 mb-4">All interactive elements should have smooth hover transitions</p>
                <div className="space-y-2">
                  <p className="font-medium">Duration: 300ms</p>
                  <p className="font-medium">Easing: ease-in-out</p>
                  <p className="font-medium">Properties: colors, transform, opacity</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Image Scaling</h3>
                <p className="text-gray-400 mb-4">Images scale on hover for enhanced interactivity</p>
                <div className="space-y-2">
                  <p className="font-medium">Scale: 1.05</p>
                  <p className="font-medium">Duration: 300ms</p>
                  <p className="font-medium">Class: group-hover:scale-105 transition-transform</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
