import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Skill = { name : Text };

  public type UserProfile = {
    name : Text;
    email : Text;
    location : Text;
    skillsOffered : [Skill];
    skillsWanted : [Skill];
    averageRating : Float;
  };

  type SwapRequest = {
    id : Nat;
    from : Principal;
    to : Principal;
    skillOffered : Text;
    skillWanted : Text;
    status : {
      #pending;
      #accepted;
      #rejected;
      #completed;
    };
    sessionTime : ?Int;
  };

  type Review = {
    swapRequestId : Nat;
    reviewer : Principal;
    reviewee : Principal;
    rating : Nat;
    comment : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let swapRequests = Map.empty<Nat, SwapRequest>();
  let reviews = Map.empty<Nat, Review>();
  var nextSwapRequestId : Nat = 0;

  // Required by frontend: get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Required by frontend: save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Required by frontend: get any user's profile
  public query ({ caller }) func getUserProfile(userId : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(userId);
  };

  // Get profile (alternative method)
  public query ({ caller }) func getProfile(userId : Principal) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  // Update profile
  public shared ({ caller }) func updateProfile(name : Text, email : Text, location : Text, skillsOffered : [Skill], skillsWanted : [Skill]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    let currentRating = switch (userProfiles.get(caller)) {
      case (null) { 0.0 };
      case (?profile) { profile.averageRating };
    };

    let profile : UserProfile = {
      name;
      email;
      location;
      skillsOffered;
      skillsWanted;
      averageRating = currentRating;
    };
    userProfiles.add(caller, profile);
  };

  // Find skill swap matches
  public query ({ caller }) func findMatches() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can find matches");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    var matches : [UserProfile] = [];
    for ((principal, profile) in userProfiles.entries()) {
      if (principal != caller and hasMatchingSkills(callerProfile, profile)) {
        matches := matches.concat([profile]);
      };
    };

    matches;
  };

  func hasMatchingSkills(user1 : UserProfile, user2 : UserProfile) : Bool {
    let user1OffersSomethingWantedByUser2 = user1.skillsOffered.find(
      func(skill) {
        switch (user2.skillsWanted.find<Skill>(func(wantedSkill) { skill.name == wantedSkill.name })) {
          case (null) { false };
          case (?_) { true };
        };
      }
    );

    let user2OffersSomethingWantedByUser1 = user2.skillsOffered.find(
      func(skill) {
        switch (user1.skillsWanted.find<Skill>(func(wantedSkill) { skill.name == wantedSkill.name })) {
          case (null) { false };
          case (?_) { true };
        };
      }
    );

    switch (user1OffersSomethingWantedByUser2, user2OffersSomethingWantedByUser1) {
      case (?_, ?_) { true };
      case _ { false };
    };
  };

  // Send swap request
  public shared ({ caller }) func sendSwapRequest(to : Principal, skillOffered : Text, skillWanted : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send swap requests");
    };

    if (to == caller) {
      Runtime.trap("Cannot send swap request to yourself");
    };

    let swapRequest : SwapRequest = {
      id = nextSwapRequestId;
      from = caller;
      to;
      skillOffered;
      skillWanted;
      status = #pending;
      sessionTime = null;
    };

    swapRequests.add(nextSwapRequestId, swapRequest);
    nextSwapRequestId += 1;
    swapRequest.id;
  };

  // Accept swap request
  public shared ({ caller }) func acceptSwapRequest(requestId : Nat, sessionTime : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept swap requests");
    };

    switch (swapRequests.get(requestId)) {
      case (null) { Runtime.trap("Swap request not found") };
      case (?request) {
        if (request.to != caller) {
          Runtime.trap("Only the recipient can accept this request");
        };
        if (request.status != #pending) {
          Runtime.trap("Can only accept pending requests");
        };
        let updatedRequest = {
          request with
          status = #accepted;
          sessionTime = ?sessionTime;
        };
        swapRequests.add(requestId, updatedRequest);
      };
    };
  };

  // Reject swap request
  public shared ({ caller }) func rejectSwapRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject swap requests");
    };

    switch (swapRequests.get(requestId)) {
      case (null) { Runtime.trap("Swap request not found") };
      case (?request) {
        if (request.to != caller) {
          Runtime.trap("Only the recipient can reject this request");
        };
        if (request.status != #pending) {
          Runtime.trap("Can only reject pending requests");
        };
        let updatedRequest = {
          request with
          status = #rejected;
        };
        swapRequests.add(requestId, updatedRequest);
      };
    };
  };

  // Mark swap as complete
  public shared ({ caller }) func markSwapComplete(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark swaps as complete");
    };

    switch (swapRequests.get(requestId)) {
      case (null) { Runtime.trap("Swap request not found") };
      case (?request) {
        if (request.from != caller and request.to != caller) {
          Runtime.trap("Only participants can mark swap as complete");
        };
        if (request.status != #accepted) {
          Runtime.trap("Can only complete accepted requests");
        };
        let updatedRequest = { request with status = #completed };
        swapRequests.add(requestId, updatedRequest);
      };
    };
  };

  // Submit review
  public shared ({ caller }) func submitReview(swapRequestId : Nat, rating : Nat, comment : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (swapRequests.get(swapRequestId)) {
      case (null) { Runtime.trap("Swap request not found") };
      case (?request) {
        // Verify caller is a participant
        if (request.from != caller and request.to != caller) {
          Runtime.trap("Only participants can review this swap");
        };

        if (request.status != #completed) {
          Runtime.trap("Can only review completed swaps");
        };

        let reviewee = if (request.from == caller) { request.to } else {
          request.from;
        };

        let review : Review = {
          swapRequestId;
          reviewer = caller;
          reviewee;
          rating;
          comment;
        };
        reviews.add(swapRequestId, review);
        updateAverageRating(reviewee);
      };
    };
  };

  func updateAverageRating(userId : Principal) {
    var userReviewsArray : [Review] = [];

    for ((_, review) in reviews.entries()) {
      if (review.reviewee == userId) {
        userReviewsArray := userReviewsArray.concat([review]);
      };
    };

    let totalReviews = userReviewsArray.size();

    if (totalReviews == 0) { return };

    var totalRating : Nat = 0;
    for (review in userReviewsArray.values()) {
      totalRating += review.rating;
    };

    // Calculate average rating using explicit type conversions
    let totalRatingInt = totalRating.toInt();
    let totalReviewsInt = totalReviews.toInt();
    let averageRating = switch (totalReviewsInt) {
      case (0) { 0.0 };
      case (_) {
        totalRatingInt.toFloat() / totalReviewsInt.toFloat();
      };
    };

    switch (userProfiles.get(userId)) {
      case (null) { () };
      case (?profile) {
        let updatedProfile = {
          profile with
          averageRating = averageRating;
        };
        userProfiles.add(userId, updatedProfile);
      };
    };
  };

  // Search users by skill
  public query ({ caller }) func searchUsersBySkill(skillName : Text) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search by skill");
    };

    var matches : [UserProfile] = [];

    for ((_, profile) in userProfiles.entries()) {
      let hasOffered = profile.skillsOffered.find(func(skill) { skill.name == skillName });
      let hasWanted = profile.skillsWanted.find(func(skill) { skill.name == skillName });

      switch (hasOffered, hasWanted) {
        case (?_, _) { matches := matches.concat([profile]) };
        case (_, ?_) { matches := matches.concat([profile]) };
        case _ { };
      };
    };

    matches;
  };

  // Get reviews for a user
  public query ({ caller }) func getReviewsForUser(userId : Principal) : async [Review] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reviews");
    };

    var userReviews : [Review] = [];

    for ((_, review) in reviews.entries()) {
      if (review.reviewee == userId) {
        userReviews := userReviews.concat([review]);
      };
    };

    userReviews;
  };

  // Get swap request status
  public query ({ caller }) func getSwapRequestStatus(requestId : Nat) : async { #pending; #accepted; #rejected; #completed } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view swap request status");
    };

    switch (swapRequests.get(requestId)) {
      case (null) { Runtime.trap("Swap request not found") };
      case (?request) { request.status };
    };
  };

  // Get all swap requests for caller
  public query ({ caller }) func getMySwapRequests() : async [SwapRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view swap requests");
    };

    var myRequests : [SwapRequest] = [];

    for ((_, request) in swapRequests.entries()) {
      if (request.from == caller or request.to == caller) {
        myRequests := myRequests.concat([request]);
      };
    };

    myRequests;
  };

  // List all users with pagination
  public query ({ caller }) func listUsers(offset : Nat, limit : Nat) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list users");
    };

    var allProfiles : [UserProfile] = [];

    for ((_, profile) in userProfiles.entries()) {
      allProfiles := allProfiles.concat([profile]);
    };

    let size = allProfiles.size();

    if (offset >= size) {
      return [];
    };

    let end = if (offset + limit > size) { size } else { offset + limit };
    Array.tabulate<UserProfile>(end - offset, func(i) { allProfiles[offset + i] });
  };
};
