let
  pinnedNixpkgs = (import <nixpkgs> {}).fetchFromGitHub {
    owner = "NixOS";
    repo = "nixpkgs";
    rev = "e0da498ad77ac8909a980f07eff060862417ccf7";
    hash = "sha256-evZzmLW7qoHXf76VCepvun1esZDxHfVRFUJtumD7L2M=";
  };
  strawberry = (import <nixpkgs> {}).fetchFromGitHub {
    owner = "goffrie";
    repo = "strawberry";
    rev = "0da2ebc430482962da4e9de5586ce9806770f390";
    hash = "sha256-6Ntsbe97vpMbO7SprFns2H2pR/DkVpd3E3ArOBIlOYI=";
  };
in { pkgs ? import pinnedNixpkgs {} }:
let
  client = import ./client { inherit pkgs; };
  server = (import "${strawberry}/build.nix" { inherit pkgs; }).server;
in
{
  inherit client server;
}
