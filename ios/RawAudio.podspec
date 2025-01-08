# ios/RawAudio.podspec
Pod::Spec.new do |s|
    s.name         = "MintontechRawAudio"
    s.version      = "1.0.0"
    s.summary      = "iOS Swift module for raw audio capture."
    s.homepage     = "https://github.com/mintontech/react-native-raw-audio"
    s.license      = "MIT"
    s.author       = { "MintonTech" => "info@mintontech.com" }
    s.ios.deployment_target = "14.0"
    s.source       = { :git => "https://github.com/mintontech/react-native-raw-audio.git", :tag => s.version }
    s.source_files = "MintontechRawAudio/**/*.{swift,h,m}"
    s.dependency "React-Core"
  end